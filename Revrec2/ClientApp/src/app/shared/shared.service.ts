import { Injectable, Inject } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../auth/auth.service';
import { DiscrepancyComment, RawDiscrepancyComment } from './../model/discrepancyComment.model';
import { MonthlySummary, MemberRevYear } from './../model/monthlysummary.model';
import { PagedList, Response, ResponseList } from '../model/response.model';
import { DiscrepancyListRequest, Discrepancy } from '../model/discrepancy.model';
import { UserOption } from '../model/user.model';
import { DiscrepancyStatusOption } from '../model/setting.model';
import { ExploreRateCell } from '../model/explore.model';
import { ReportService } from '../report/report.service';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private baseUrl: string;

  public monthlySummaryListChanged = new Subject<PagedList<MonthlySummary>>();
  public monthYearFetched = new Subject<MemberRevYear[]>();

  public disrepancyCommentListChanged = new Subject<PagedList<RawDiscrepancyComment>>();
  public discrepancyCommentCreated = new Subject<RawDiscrepancyComment>();
  public discrepancyCommentReplied = new Subject<RawDiscrepancyComment>();
  public discrepancyCommentUpdated = new Subject<RawDiscrepancyComment>();


  public disrepancyListChanged = new Subject<PagedList<Discrepancy>>();
  // This is used to seperate the Main-list / Sub-list
  public disrepancySubListChanged = new Subject<PagedList<Discrepancy>>();

  public discrepancyUpdated = new Subject<Discrepancy[]>();
  public discrepancyBulkUpdated = new Subject<any>();
  public afterDiscrepancyBulkUpdated = new Subject<any>();
  public onContainerSearched = new Subject<any>();

  public exploreRateCellListChanged = new Subject<ExploreRateCell[]>();

  public displayedDiscrepancy: Discrepancy;

  constructor(private http: HttpClient,
    private authService: AuthService,
    // private reportService: ReportService,
    @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl + 'api/';
  }

  private _getDiscrepancy(con1, con2, exportAll?: boolean) {
    const url = this.baseUrl + 'discrepancy/GetDiscrepancyRecordListByFilters'
    // console.log(con2.includeResolved)
    const pageRequest = {
      pageIndex: con1.pageIndex ? con1.pageIndex : 0,
      pageSize: con1.pageSize ? con1.pageSize : 25,
      sortBy: con1.sortBy ? con1.sortBy : '',
      orderBy: con1.orderBy ? con1.orderBy : '',
    };

    const filters: DiscrepancyListRequest = {
      MMIS_ID: con2.MMIS_ID ? con2.MMIS_ID : '',
      CCAID: con2.CCAID ? con2.CCAID : '',
      name: con2.Name ? con2.Name.trim() : '',
      MasterPatientID: con2.MasterPatientID ? con2.MasterPatientID : null,
      discoverDateStart: con2.discoverDateStart ? con2.discoverDateStart : '',
      discoverDateEnd: con2.discoverDateEnd ? con2.discoverDateEnd : '',
      resolutionDateStart: con2.resolutionDateStart ? con2.resolutionDateStart : '',
      resolutionDateEnd: con2.resolutionDateEnd ? con2.resolutionDateEnd : '',
      hasComment: con2.hasComment ? (con2.hasComment === true ? 1 : 0) : 0,
      includeResolved: con2.includeResolved ? (con2.includeResolved === true ? 1 : 0) : 0,
      varianceSign: con2.varianceSign ? (con2.varianceSign === 'positive' ? 1 : 0) : null,
      typeRateCell: con2.discrepancyTypes && (con2.discrepancyTypes as [String]).length ? ((con2.discrepancyTypes as [String]).includes('Rate Cell') ? 1 : 0) : null,
      typeRegion: con2.discrepancyTypes && (con2.discrepancyTypes as [String]).length ? ((con2.discrepancyTypes as [String]).includes('Region') ? 1 : 0) : null,
      typePatientPay: con2.discrepancyTypes && (con2.discrepancyTypes as [String]).length ? ((con2.discrepancyTypes as [String]).includes('Patient Pay') ? 1 : 0) : null,
      typePatientSpendDown: con2.discrepancyTypes && (con2.discrepancyTypes as [String]).length ? ((con2.discrepancyTypes as [String]).includes('Patient Spend Down') ? 1 : 0) : null,
      typePaymentError: con2.discrepancyTypes && (con2.discrepancyTypes as [String]).length ? ((con2.discrepancyTypes as [String]).includes('Payment Error') ? 1 : 0) : null,
      /** @TODO TEMP Value 20 => non-member */
      // work with list
      memberEnrollmentStatusId: (con2.memberEnrollmentStatus !== 20
        && con2.memberEnrollmentStatus !== 21) ? con2.memberEnrollmentStatus : null,
      /** @TODO TEMP Value 20 => non-member */
      // work with report
      memberIsEnrolled: (con2.memberIsEnrolled === 1 || con2.memberIsEnrolled === 0) ? con2.memberIsEnrolled : (con2.memberEnrollmentStatus === 20 ? 0 :
        (con2.memberEnrollmentStatus === 21 ? 1 : null)),
      months: {
        BulkDate: con2.months ? con2.months.map((month: string) => { return { UpdateDate: month } }) : []
      },
      programs: {
        BulkText: con2.programs ? con2.programs.map((product: string) => { return { UpdateText: product } }) : []
      },
      ccaRateCellIds: {
        BulkID: con2.ccaRateCellIds ? con2.ccaRateCellIds.map((ccaRateCellId: number) => { return { UpdateID: ccaRateCellId } }) : []
      },
      discrepancyStatusIDs: {
        BulkID: con2.discrepancyStatusIDs ? con2.discrepancyStatusIDs.map((discrepancyStatusID: number) => { return { UpdateID: discrepancyStatusID } }) : []
      },
      assigneeIDs: {
        BulkID: con2.assigneeIDs ? con2.assigneeIDs.map((assigneeID: number) => { return { UpdateID: assigneeID } }) : []
      },
      exportAll: exportAll ? 1 : 0
    };

    let requestBody = { ...pageRequest, ...filters };
    console.log(" Get Discrepancies", url, requestBody)

    return this.http.post<Response<PagedList<Discrepancy>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    });
  }

  getpagedListInl(): PagedList<any> {
    let pagedListInl: PagedList<any> = {
      list: [],
      count: 0,
      pageSize: null,
      pageIndex: 0,
      sortBy: null,
      orderBy: null
    };
    return pagedListInl;
  }

  getMemberRevYearsByPatientID(masterPatientID: number) {
    const url = this.baseUrl + 'Discrepancy/MonthlySummaryRecordMemberYears/' + masterPatientID;

    console.log(`GET MemberRevYears By PatientID(${masterPatientID})`, url)
    return this.http.get<Response<ResponseList<MemberRevYear>>>(url, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log(`GET MemberRevYears By PatientID(${masterPatientID}) =>`, result.data.list)
        this.monthYearFetched.next(result.data.list);
      }
    });
  }


  getMemebrMonthlySummaryrByYear(masterPatientID, year) {
    const url = this.baseUrl + 'Discrepancy/MonthlySummaryRecordMemberMonths'
    const pageRequest = {
      memberYear: year,
      masterPatientID: masterPatientID,
    };

    let requestBody = { ...pageRequest, };
    console.log(" Get MSR", url, requestBody)
    return this.http.post<Response<PagedList<MonthlySummary>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log(" Get MSR =>", result.data.list)
        this.monthlySummaryListChanged.next(result.data);
      }
    });
  }

  getDiscrepancyCommnetByDiscrepancyID(discrepancyId?) {
    const url = this.baseUrl + 'Discrepancy/DiscrepancyCommentListById/' + discrepancyId;

    console.log(`GET Comments by discrepancyId(${discrepancyId})`, url, discrepancyId)
    return this.http.get<Response<PagedList<RawDiscrepancyComment>>>(url, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log(`GET Comments by discrepancyId(${discrepancyId}) =>`, result)
        this.disrepancyCommentListChanged.next(result.data);
      }
    });
  }


  createDiscreapncyComment(discrepancyComment: RawDiscrepancyComment, anchoredUserIds: number[], masterPatientID: number, type: "reply" | "create") {
    const url = this.baseUrl + 'Discrepancy/CreateDiscrepancyComment'

    const requestBody = {
      discrepancyCommentForCreateDto: {
        DiscrepancyID: discrepancyComment.discrepancyID,
        ReplyCommentID: discrepancyComment.replyCommentID,
        DiscrepancyComment: discrepancyComment.discrepancyComment,
        ActiveFlag: discrepancyComment.activeFlag
      },
      anchoredUserIds: anchoredUserIds,
      masterPatientID: masterPatientID
    };
    console.log("POST Create DiscreapncyComment", url, requestBody)

    return this.http.post<Response<number>>(url, requestBody, {
      observe: 'body',
      responseType: 'json',
    }).subscribe(result => {
      if (result.isSuccess || result.code === 3) {
        discrepancyComment.discrepancyCommentID = result.data
        console.log("POST Create DiscreapncyComment=>", result)

        switch (type) {
          case 'create':
            this.discrepancyCommentCreated.next(discrepancyComment);
            break;
          case 'reply':
            this.discrepancyCommentReplied.next(discrepancyComment);
            break;
          default:
            break;
        }
      }
    });
  }

  updateDiscreapncyComment(discrepancyComment: RawDiscrepancyComment) {
    const requestBody = {
      DiscrepancyComment: discrepancyComment.discrepancyComment,
      ActiveFlag: discrepancyComment.activeFlag,
    };
    const discrepancyCommentID = discrepancyComment.discrepancyCommentID;

    const url = this.baseUrl + 'Discrepancy/UpdateDiscrepancyComment/' + discrepancyCommentID;
    console.log("PATCH update DiscreapncyComment", url, requestBody)
    return this.http.patch<Response<any>>(url, requestBody, {
      observe: 'body',
      responseType: 'json',
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("PATCH update DiscreapncyComment =>", discrepancyComment)
        this.discrepancyCommentUpdated.next(discrepancyComment);
      }
    });
  }

  getDiscrepancyById(discreapncyID: number) {
    const url = this.baseUrl + 'discrepancy/GetDiscrepancyById/' + discreapncyID;
    console.log("GET get Discreapncybyid", url)
    return this.http.get<Response<Discrepancy>>(url, {
      observe: 'body',
      responseType: 'json',
    });
  }

  resetSort() {
    this.onContainerSearched.next();
  }

  getDiscrepancyReport(con1, con2) {
    // if (exportAll) {
    return this._getDiscrepancy(con1, con2, true);
    // }
  }

  getDiscrepancies(con1, con2, isSublist: boolean, exportAll?: boolean) {
    return this._getDiscrepancy(con1, con2, exportAll).subscribe(result => {
      if (result.isSuccess) {
        console.log(" Get Discrepancies =>", result.data)
        /** @Todo Seperate Main/Sub list in more elegant way  */
        if (isSublist) {
          this.disrepancySubListChanged.next(result.data);
        } else {
          this.disrepancyListChanged.next(result.data);
        }
      }
    });
  }

  updateDiscrepancy(discrepancy: Discrepancy, discrepancyPrev: Discrepancy) {
    const requestBody = {
      AssigneeID: discrepancy.assigned_UserID,
      DiscrepancyStatusID: discrepancy.discrepancyStatusID,
      DueDate: discrepancy.dueDate,
      discrepancy: discrepancy,
      assignmentChanged: discrepancy.assigned_UserID !== discrepancyPrev.assigned_UserID
    };

    const discrepancyID = discrepancy.discrepancyID;

    const url = this.baseUrl + 'discrepancy/UpdateDiscrepancyByID/' + discrepancyID;

    console.log("PATCH Update Discrepancy", url, requestBody)
    return this.http.patch<Response<any>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("PATCH Update Discrepancy =>", discrepancy)
        this.discrepancyUpdated.next([discrepancy, discrepancyPrev]);
      }
    });
  }

  getRateCellCrossSourceListByDiscrepancyId(discrepancyId: number, form: { startDate: Moment | string, endDate: Moment | string }) {
    const requestBody = {
      StartDate: form.startDate ? (form.startDate as Moment).format("YYYY-MM-DD") : "",
      EndDate: form.endDate ? (form.endDate as Moment).format("YYYY-MM-DD") : "",
    };

    const url = this.baseUrl + 'discrepancy/GetDiscrepancyById/' + discrepancyId + '/GetRateCellCrossSourceList';

    console.log('POST get rate cell cross source', discrepancyId, requestBody)

    return this.http.post<Response<ResponseList<ExploreRateCell>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("Rate Cell Cross Source Comparison =>", result)
        this.exploreRateCellListChanged.next(<ExploreRateCell[]>result.data.list);
      }
    });
  }

  bulkUpdateDiscrepancyByIds(
    form: {
      discrepancyIDs: number[],
      discrepancies: Discrepancy[],
      Assigned_User: UserOption,
      DueDate: any,
      DiscrepancyStatus: DiscrepancyStatusOption,
      DiscrepancyComment: string,
    }) {

    const requestBody = {
      DiscrepancyIDs: {
        BulkID: form.discrepancies.map((discrepancy: Discrepancy) => {
          return { UpdateID: discrepancy.discrepancyID };
        })
      },
      discrepancies: form.discrepancies,
      DiscrepancyStatusId: form.DiscrepancyStatus ? form.DiscrepancyStatus.discrepancyStatusID : "",
      Assigned_UserID: form.Assigned_User ? form.Assigned_User.userID : "",
      DueDate: form.DueDate,
      DiscrepancyComment: form.DiscrepancyComment
    };
    const url = this.baseUrl + 'discrepancy/UpdateMultipleDiscrepanciesByIdList';

    console.log("POST bulk update discrepancy", url, requestBody)
    return this.http.post<Response<any>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("POST bulk update discrepancy =>", requestBody)
        this.discrepancyBulkUpdated.next(form);
      }
    });
  }

  onAfterDiscrepancyBulkUpdated(form: any) {
    this.afterDiscrepancyBulkUpdated.next(form);
  }

  onDiscrepancyDetailClick(e) {
    this.displayedDiscrepancy = e;
  }

  getDisplayedDiscrepancy() {
    return this.displayedDiscrepancy;
  }
}
