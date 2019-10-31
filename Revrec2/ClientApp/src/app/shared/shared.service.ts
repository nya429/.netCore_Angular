import { DiscrepancyComment, RawDiscrepancyComment } from './../model/discrepancyComment.model';
import { MonthlySummary, MemberRevYear } from './../model/monthlysummary.model';
import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { PagedList, Reponse, ReponseList } from '../model/response.model';
import { Subject } from 'rxjs';
import { DiscrepancyListRequest, Discrepancy } from '../model/discrepancy.model';
import { UserOption } from '../model/user.model';
import { DiscrepancyStatusOption } from '../model/setting.model';
import { AuthService } from '../auth/auth.service';

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

  constructor(private http: HttpClient,
    private authService: AuthService,
    @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl + 'api/';
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
    return this.http.get<Reponse<ReponseList<MemberRevYear>>>(url, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log(`GET MemberRevYears By PatientID(${masterPatientID}) =>`, result.data.list)
        this.monthYearFetched.next(result.data.list);
      }
    }, error => {
      console.error(`GET MemberRevYears By PatientID(${masterPatientID}) =>`, error);
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
    return this.http.post<Reponse<PagedList<MonthlySummary>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log(" Get MSR =>", result.data.list)
        this.monthlySummaryListChanged.next(result.data);
      }
    }, error => {
      console.error(" Get MSR =>", error);
    });
  }

  getDiscrepancyCommnetByDiscrepancyID(discrepancyId?) {
    const url = this.baseUrl + 'Discrepancy/DiscrepancyCommentListById/' + discrepancyId;

    console.log(`GET Comments by discrepancyId(${discrepancyId})`, url, discrepancyId)
    return this.http.get<Reponse<PagedList<RawDiscrepancyComment>>>(url, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log(`GET Comments by discrepancyId(${discrepancyId}) =>`, result.data.list)
        this.disrepancyCommentListChanged.next(result.data);
      }
    }, error => {
      console.error(`GET Comments by discrepancyId(${discrepancyId}) =>`, error);
    });
  }


  createDiscreapncyComment(discrepancyComment: RawDiscrepancyComment, type: "reply" | "create") {
    const url = this.baseUrl + 'Discrepancy/CreateDiscrepancyComment'

    console.log("POST Create DiscreapncyComment", url, discrepancyComment)
    const requestBody =
    {
      DiscrepancyID: discrepancyComment.discrepancyID,
      ReplyCommentID: discrepancyComment.replyCommentID,
      DiscrepancyComment: discrepancyComment.discrepancyComment,
      ActiveFlag: discrepancyComment.activeFlag
    };

    return this.http.post<Reponse<number>>(url, requestBody, {
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
    }, error => {
      console.error(error);
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
    return this.http.patch<Reponse<any>>(url, requestBody, {
      observe: 'body',
      responseType: 'json',
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("PATCH update DiscreapncyComment =>", discrepancyComment)
        this.discrepancyCommentUpdated.next(discrepancyComment);
      }
    }, error => {
      console.error("PATCH update DiscreapncyComment =>", error);
    });
  }

  getDiscrepancies(con1, con2, isSublist: boolean) {
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
    };

    let requestBody = { ...pageRequest, ...filters };
    console.log(" Get Discrepancies", url, requestBody)
    return this.http.post<Reponse<PagedList<Discrepancy>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log(" Get Discrepancies =>", result.data)
        /** @Todo Seperate Main/Sub list in more elegant way  */
        if (isSublist) {
          this.disrepancySubListChanged.next(result.data);
        } else {
          this.disrepancyListChanged.next(result.data);

        }
      }
    }, error => {
      console.error(" Get Discrepancies =>", error);
    });
  }

  updateDiscrepancy(discrepancy: Discrepancy, discrepancyPrev: Discrepancy) {
    const requestBody = {
      AssigneeID: discrepancy.assigned_UserID,
      DiscrepancyStatusID: discrepancy.discrepancyStatusID,
      DueDate: discrepancy.dueDate,
    };

    const discrepancyID = discrepancy.discrepancyID;

    const url = this.baseUrl + 'discrepancy/' + discrepancyID;

    console.log("PATCH Update Discrepancy", url, requestBody)
    return this.http.patch<Reponse<any>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("PATCH Update Discrepancy =>", discrepancy)
        this.discrepancyUpdated.next([discrepancy, discrepancyPrev]);
      }
    }, error => {
      console.error("PATCH Update Discrepancy =>", error);
    });
  }

  bulkUpdateDiscrepancyByIds(
    form: {
      discrepancyIDs: number[],
      Assigned_User: UserOption,
      DueDate: any,
      DiscrepancyStatus: DiscrepancyStatusOption,
      DiscrepancyComment: string,
    }) {

    const requestBody = {
      DiscrepancyIDs: {
        BulkID: form.discrepancyIDs.map((discrepancyID: number) => {
          return { UpdateID: discrepancyID };
        })
      },
      DiscrepancyStatusId: form.DiscrepancyStatus ? form.DiscrepancyStatus.discrepancyStatusID : "",
      Assigned_UserID: form.Assigned_User ? form.Assigned_User.userID : "",
      DueDate: form.DueDate,
      DiscrepancyComment: form.DiscrepancyComment
    };
    const url = this.baseUrl + 'discrepancy/UpdateMultipleDiscrepancies';

    console.log("POST bulk update discrepancy", url, requestBody)
    return this.http.post<Reponse<any>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("POST bulk update discrepancy =>", requestBody)
        this.discrepancyBulkUpdated.next(form);
      }
    }, error => {
      console.error("POST bulk update discrepancy =>", error);
    });
  }

  onAfterDiscrepancyBulkUpdated(form: any) {
    this.afterDiscrepancyBulkUpdated.next(form);
  }
}
