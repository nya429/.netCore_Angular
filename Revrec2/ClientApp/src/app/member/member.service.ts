import { MemberName } from './../model/member.model';
import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
// import { DisElement } from '../MOCK_DATA';
import { Subject } from 'rxjs';
import { Response, PagedList, ResponseList } from '../model/response.model';
import { MemberPaged, Member } from '../model/member.model';
import { SharedService } from '../shared/shared.service';
import { UserOption } from '../model/user.model';
import { DiscrepancyStatusOption } from '../model/setting.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private baseUrl: string;
  private queryData: MemberName;
  private displayedDiscrepancy: any;
  public memebrDetailShowing: boolean;


  public onDiscrepancyDetailOpened = new Subject<any>();
  public memberListChanged = new Subject<PagedList<MemberPaged>>();
  public singleMemberListFetch = new Subject<MemberPaged>();
  public memberNamesFetched = new Subject<MemberName[]>();
  public memebrFetched = new Subject<Member>();

  public memberDiscrepancyBulkUpdated = new Subject<any>();

  constructor(private http: HttpClient,
    private _sharedService: SharedService,
    @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl + 'api/';
    this.memebrDetailShowing = true;
  }

  get sharedService() {
    return this._sharedService;
  }

  onDiscrepancyDetailOpen(e: any): void {
    this.displayedDiscrepancy = e;
    this.onDiscrepancyDetailOpened.next(this.displayedDiscrepancy);
  }

  onDiscrepancyDetailClose(): void {
    this.displayedDiscrepancy = null;
    this.onDiscrepancyDetailOpened.next(this.displayedDiscrepancy);
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


  getMembers(con) {
    const url = this.baseUrl + 'members/GetMemberList'
    const pageRequest = {
      // Pagination
      pageIndex: con.pageIndex ? con.pageIndex : 0,
      pageSize: con.pageSize ? con.pageSize : 50,
      sortBy: con.sortBy ? con.sortBy : '',
      orderBy: con.orderBy === 0 ? con.orderBy : (con.orderBy ? con.orderBy : 1),
      // Filters
      includeZeroDiscrepancy: con.includeZeroDiscrepancy ? 1 : 0,
      assigneeID: con.assigneeID ? con.assigneeID : null,
      MMIS_ID: con.MMIS_ID ? con.MMIS_ID : '',
      CCAID: con.CCAID ? con.CCAID : '',
      Name: con.Name ? con.Name.trim() : '',
      MasterPatientID: con.MasterPatientID ? con.MasterPatientID.trim() : '',
    };

    let requestBody = { ...pageRequest, };
    console.log("Get Members", url, requestBody)
    return this.http.post<Response<PagedList<MemberPaged>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("Get Members =>", result.data)
        this.memberListChanged.next(result.data);
      }
    });
  }

  getMemberByMasterPatientId(con) {
    const url = this.baseUrl + 'members/GetMemberList'
    const pageRequest = {
      // Pagination
      pageIndex: 0,
      pageSize: 1,
      sortBy: '',
      orderBy: 1,
      // Filters
      includeZeroDiscrepancy: 1,
      assigneeID: con.assigneeID ? con.assigneeID : null,
      MMIS_ID: '',
      CCAID: '',
      Name: '',
      MasterPatientID: con.masterPatientId,
    };

    let requestBody = { ...pageRequest, };
    console.log("Get (individual)Members by id", url, requestBody)
    return this.http.post<Response<PagedList<MemberPaged>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("Get (individual)Members by id =>", result.data)
        this.singleMemberListFetch.next(result.data.list[0]);
      }
    });
  }


  getMemberByPatientByID(masterPatientID: number) {
    const url = this.baseUrl + 'members/GetMemberInfo/' + masterPatientID;

    console.log(`GET Member (${masterPatientID})`, url)
    return this.http.get<Response<Member>>(url, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log(`GET Member (${masterPatientID}) =>`, result.data)
        this.memebrFetched.next(result.data);
      }
    });
  }

  getMemberNamesByNamePartial(memebrNamePartial: string) {
    const url = this.baseUrl + 'members/GetMemberByName/' + memebrNamePartial;

    console.log(`Get MemberNames By Partial(${memebrNamePartial})`, url)
    return this.http.get<Response<ResponseList<MemberName>>>(url, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log(`Get MemberNames By Partial(${memebrNamePartial}) =>`, result.data.list)
        this.memberNamesFetched.next(result.data.list);
      }
    });
  }


  bulkUpdateMemberDiscrepancyByIds(
    form: {
      MemberIds: number[],
      Assigned_User: UserOption,
      DueDate: any,
      DiscrepancyStatus: DiscrepancyStatusOption,
      DiscrepancyComment: string,
    }) {

    const requestBody = {
      MemberIds: {
        MemberID: form.MemberIds.map((MemberId: number) => {
          return { UpdateID: MemberId };
        })
      },
      DiscrepancyStatusId: form.DiscrepancyStatus ? form.DiscrepancyStatus.discrepancyStatusID : "",
      Assigned_UserID: form.Assigned_User ? form.Assigned_User.userID : "",
      DueDate: form.DueDate,
      DiscrepancyComment: form.DiscrepancyComment
    };
    const url = this.baseUrl + 'members/UpdateDiscrepancyForMultipleMembers';

    console.log("POST Bulk Update Members' Discrepancy By MemberIDs", url, requestBody)
    return this.http.post<Response<any>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("POST Bulk Update Members' Discrepancy By MemberIDs => Success")
        this.memberDiscrepancyBulkUpdated.next(form);
      }
    });
  }

  onMemberDetailToggle(detailShowing: boolean) {
    this.memebrDetailShowing = detailShowing;
  }

  isMemberDetailShowing(): boolean {
    return this.memebrDetailShowing;
  }


}
