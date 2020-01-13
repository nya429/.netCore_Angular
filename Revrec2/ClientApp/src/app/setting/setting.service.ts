import { UserOption, User } from './../model/user.model';
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FORM_OPTIONS_MOCK } from './setting-ratecard/setting-ratecard-form-dialog/setting-ratecard-form-dialog.component';
import { Subject, Observable, combineLatest } from 'rxjs';
import { PagedList, ResponseList, Response } from '../model/response.model';
import {
  CCARateCell,
  CCARegion,
  DiscrepancyCategoryOption,
  DiscrepancyStatusOption,
  RateCard,
  RateCellMap,
  RegionMap,
  DiscrepancyStatus,
  DiscrepancyCategory
} from '../model/setting.model';
import { combineAll } from 'rxjs/operators';
import { Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private baseUrl: string;
  private pagedListInl: PagedList<any>;
  private CCARateCellOptions: CCARateCell[] = [];
  private CCARegionOptions: CCARegion[] = [];
  private discrepancyCategoryOptions: DiscrepancyCategoryOption[] = [];
  private discrepancyStatusOptions: DiscrepancyStatusOption[] = [];
  private discrepancyStatusTypeOptions:
    {
      value: number,
      type: string
    }[] =
    [
      { value: 1, type: '	User Entered' },
      { value: 0, type: '	System' },
    ];
  private userOptions: UserOption[];
  private productOptions = ['SCO', 'ICO'];


  formOptionMOCK = FORM_OPTIONS_MOCK;

  public rateCardListChanged = new Subject<PagedList<RateCard>>();
  public rateCardCreated = new Subject<RateCard>();
  public rateCardUpdated = new Subject<RateCard>();

  public ccaRateCellListChanged = new Subject<ResponseList<CCARateCell>>();
  public ccaRegionListChanged = new Subject<ResponseList<CCARegion>>();

  public rateCardOptionReady$ = new Observable<any>();
  public optionsReady$ = new Observable<any>();

  public rateCellMapListChanged = new Subject<PagedList<RateCellMap>>();
  public rateCellMapUpdated = new Subject<RateCellMap>();
  public rateCellMapUnmappdCountGot = new Subject<number>();

  public regionMapListChanged = new Subject<PagedList<RegionMap>>();
  public regionMapUpdated = new Subject<RegionMap>();
  public regionMapUnmappdCountGot = new Subject<number>();


  public discrepancyStatusListChanged = new Subject<PagedList<DiscrepancyStatus>>();
  public discrepancyStatusUpdated = new Subject<any>();
  public discrepancyStatusCreated = new Subject<any>();
  public discrepacnyStatusOptionsReady = new Subject<any>();

  public discrepancyCategoryListChanged = new Subject<PagedList<DiscrepancyCategory>>();
  public discrepancyCategoryUpdated = new Subject<any>();
  public discrepancyCategoryCreated = new Subject<any>();
  public discrepacnyCategoryOptionsReady = new Subject<any>();

  public userListChanged = new Subject<PagedList<User>>();
  public userUpdated = new Subject<any>();
  public userCreated = new Subject<any>();
  public userOptionsReady = new Subject<any>();

  constructor(private http: HttpClient,
    @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl + 'api/';

    this.rateCardOptionReady$ = combineLatest(this.ccaRateCellListChanged, this.ccaRegionListChanged)
    this.optionsReady$ = combineLatest(this.ccaRateCellListChanged,
      this.ccaRegionListChanged,
      this.discrepacnyStatusOptionsReady,
      this.userOptionsReady,
      this.discrepacnyCategoryOptionsReady);
  }

  initOpionts() {
    this.getCCARateCells();
    this.getCCARegions();
    this.getDiscrepancyCategoryOptions();
    this.getDiscrepancyStatusOptions();
    this.getUserOptions();
  }

  getRateCards(con1, con2) {
    const url = this.baseUrl + 'ratecards/GetRateCardList'

    const pageRequest = {
      pageIndex: con1.pageIndex ? con1.pageIndex : 0,
      pageSize: con1.pageSize ? con1.pageSize : 25,
      sortBy: con1.sortBy ? con1.sortBy : '',
      orderBy: con1.orderBy ? con1.orderBy : '',
    };

    const filters = {
      ccaRateCell: con2.ccaRateCell ? con2.ccaRateCell.trim() : con2.ccaRateCell,
      ccaRegion: con2.ccaRegion ? con2.ccaRegion.trim() : con2.ccaRegion,
      endDate: con2.endDate,
      startDate: con2.startDate
    };

    let requestBody = { ...pageRequest, ...filters };
    console.log("Get RateCards", url, requestBody)
    return this.http.post<Response<PagedList<RateCard>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("Get RateCards =>", result.data)
        this.rateCardListChanged.next(result.data);
      }
    });
  }

  createRateCard(rateCard: RateCard) {
    const url = this.baseUrl + 'ratecards/CreateRateCard'
    console.log("POST Create RateCard", url, rateCard)
    const requestBody = rateCard;
    return this.http.post<Response<number>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess || result.code === 3) {
        rateCard.rateCardId = result.data
        console.log("POST Create RateCard => success")
        this.rateCardCreated.next(rateCard);
      }
    });
  }

  updateRateCard(rateCard: RateCard) {
    const requestBody = rateCard;
    const rateCardId = rateCard.rateCardId;

    const url = this.baseUrl + 'ratecards/UpdateRateCard/' + rateCardId;
    console.log("PATCH update RateCard", url, rateCard)
    return this.http.patch<Response<any>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("PATCH Update Ratecard =>", result)
        this.rateCardUpdated.next(rateCard);
      }
    });
  }


  getCCARateCells(ccaRateCell?: string, product?: string) {
    const url = this.baseUrl + 'ccaratecells/GetCCARateCellList'
    console.log("Get CCARateCells", url, ccaRateCell, product)
    const requestBody = {
      product: product,
      ccaRateCell: ccaRateCell,
    };
    return this.http.post<Response<ResponseList<CCARateCell>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      console.log('Get CCARateCells =>', result);
      if (result.isSuccess) {
        this.CCARateCellOptions = result.data.list;
        this.ccaRateCellListChanged.next(result.data);
      }
    });
  }

  getCCARegions(ccaRegion?: string, product?: string) {
    const url = this.baseUrl + 'ccaRegions/GetCCARegionList'
    console.log("Get CCARegions", url, ccaRegion, product)
    const requestBody = {
      product: product,
      ccaRegion: ccaRegion,
    };
    return this.http.post<Response<ResponseList<CCARegion>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      console.log('Get CCARegions =>', result.data.list)
      if (result.isSuccess) {
        this.CCARegionOptions = result.data.list;
        this.ccaRegionListChanged.next(result.data);
      }
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

  getOptions(option: string, product?: string): any[] {

    if (!this.CCARateCellOptions || !this.CCARegionOptions) {
      return [];
    }

    switch (option) {
      case 'rateCell':
        return product ? this.CCARateCellOptions.filter(rc => rc.product == product) : this.CCARateCellOptions;
      case 'region':
        return product ? this.CCARegionOptions.filter(rc => rc.product == product) : this.CCARegionOptions;
      case 'product':
        return this.productOptions;
      case 'discrepancyStatus':
        return this.discrepancyStatusOptions;
      case 'discrepancyCategory':
        return this.discrepancyCategoryOptions;
      case 'discrepancyStatusType':
        return this.discrepancyStatusTypeOptions;
      case 'assigned_User':
        return this.userOptions;
      default:
        return null
    }
  }

  getRateCardFormOptions() {
    return {
      productOptions: this.productOptions,
      CCARateCellOptions: this.CCARateCellOptions,
      CCARegionOptions: this.CCARegionOptions
    };
  }

  getDiscrepancyStatusFormOptions() {
    return {
      discrepancyCategoryOption: this.discrepancyCategoryOptions,
      discrepancyStatusTypeOption: this.discrepancyStatusTypeOptions,
    };
  }

  getDiscrepancyBulkUpdateFormOptions() {
    return {
      userOptions: this.userOptions,
      discrepancyStatusOptions: this.discrepancyStatusOptions,
    };
  }

  createDiscrepancyStatus(discrepancyStatus: DiscrepancyStatus) {
    const url = this.baseUrl + 'discrepancystatus/CreateDiscrepancyStatus'
    console.log("POST Create DiscrepancyStatus", url, discrepancyStatus)
    const requestBody = discrepancyStatus;
    return this.http.post<Response<number>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess || result.code === 3) {
        console.log("POST Create DiscrepancyStatus => Success")
        discrepancyStatus.discrepancyStatusId = result.data
        this.discrepancyStatusCreated.next(discrepancyStatus);
        this.getDiscrepancyStatusOptions();
      }
    });
  }

  updateDiscrepancyStatus(discrepancyStatus: DiscrepancyStatus) {
    const requestBody = {
      discrepancyStatus: discrepancyStatus.discrepancyStatus,
      discrepancyStatusDescription: discrepancyStatus.discrepancyStatusDescription,
      discrepancyCategoryID: discrepancyStatus.discrepancyCategoryID,
      activeFlag: discrepancyStatus.activeFlag
    };
    const discrepancyStatusID = discrepancyStatus.discrepancyStatusId;


    const url = this.baseUrl + 'discrepancystatus/UpdateDiscrepancyStatusByID/' + discrepancyStatusID;
    console.log("PATCH Update RateCell Map", url, discrepancyStatus)
    return this.http.patch<Response<any>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log('PATCH Update RateCell Map =>', discrepancyStatus)
        this.discrepancyStatusUpdated.next(discrepancyStatus);
        this.getDiscrepancyStatusOptions();
      }
    });
  }

  getDiscrepancyStatuses(con1, con2) {
    const url = this.baseUrl + 'discrepancystatus/GetDiscrepancyStatusesList'

    const pageRequest = {
      pageIndex: con1.pageIndex ? con1.pageIndex : 0,
      pageSize: con1.pageSize ? con1.pageSize : 25,
      sortBy: con1.sortBy ? con1.sortBy : '',
      orderBy: con1.orderBy ? con1.orderBy : '',
    };

    const filters = {
      discrepancyStatus: con2.discrepancyStatus ? con2.discrepancyStatus.trim() : con2.discrepancyStatus,
      discrepancyCategoryID: con2.discrepancyCategoryID,
      discrepancyStatusType: con2.discrepancyStatusType
    };

    let requestBody = { ...pageRequest, ...filters };
    console.log("Get DiscrepancyStatus", url, requestBody)
    return this.http.post<Response<PagedList<DiscrepancyStatus>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("Get DiscrepancyStatus =>", result.data)
        this.discrepancyStatusListChanged.next(result.data);
      }
    });
  }

  getDiscrepancyStatusOptions() {
    const url = this.baseUrl + 'discrepancystatus/getDiscrepancyStatusOptions'
    console.log("GET Discrepancy Status Option", url)

    return this.http.get<Response<ResponseList<DiscrepancyStatusOption>>>(url, {
      observe: 'body',
      responseType: 'json'
    })
      .subscribe(result => {
        if (result.isSuccess) {
          console.log("GET DiscrepancyStatusOptions =>", result.data.list)
          this.discrepancyStatusOptions = result.data.list;
          this.discrepacnyStatusOptionsReady.next();
        }
      });
  }


  getDiscrepancyCategoryOptions() {
    const url = this.baseUrl + 'discrepancycategory/GetDiscrepancyCategoryOptions'
    console.log("GET Discrepancy Category Option", url)

    return this.http.get<Response<ResponseList<DiscrepancyCategoryOption>>>(url, {
      observe: 'body',
      responseType: 'json'
    })
      .subscribe(result => {
        if (result.isSuccess) {
          console.log("GET Discrepancy Category Option =>", result.data.list)
          this.discrepancyCategoryOptions = result.data.list;
          this.discrepacnyCategoryOptionsReady.next();
        }
      });
  }

  getDiscrepancyCategories(con1?) {
    const url = this.baseUrl + 'discrepancyCategory/GetDiscrepancyCategoryList'

    const pageRequest = {
      pageIndex: con1.pageIndex ? con1.pageIndex : 0,
      pageSize: con1.pageSize ? con1.pageSize : 25,
      sortBy: con1.sortBy ? con1.sortBy : '',
      orderBy: con1.orderBy ? con1.orderBy : '',
    };

    let requestBody = { ...pageRequest };
    console.log("Get discrepancyCategory", url, requestBody)
    return this.http.post<Response<PagedList<DiscrepancyCategory>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        // this.discrepancyCategoryOptions = result.data.list;
        console.log("Get discrepancyCategory=>", result.data)
        this.discrepancyCategoryListChanged.next(result.data);
      }
    });
  }


  updateDiscrepancyCategory(discrepancyCategory: DiscrepancyCategory) {
    const requestBody = {
      discrepancyCategory: discrepancyCategory.discrepancyCategory,
      discrepancyCategoryDescription: discrepancyCategory.discrepancyCategoryDescription,
      discrepancyCategoryDisplay: discrepancyCategory.discrepancyCategoryDisplay,
      activeFlag: discrepancyCategory.activeFlag
    };
    const discrepancyCategoryID = discrepancyCategory.discrepancyCategoryID;


    const url = this.baseUrl + 'discrepancycategory/UpdateDiscrepancyCategoryByID/' + discrepancyCategoryID;
    console.log("PATCH Update Discrepancycategory", url, discrepancyCategory)
    return this.http.patch<Response<any>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("PATCH Update Discrepancycategory =>", discrepancyCategory)
        this.discrepancyCategoryUpdated.next(discrepancyCategory);
        this.getDiscrepancyStatusOptions();
        this.getDiscrepancyCategoryOptions();
      }
    });
  }

  createDiscrepancyCategory(discrepancyCategory: DiscrepancyCategory) {
    const url = this.baseUrl + 'discrepancycategory/CreateDiscreapancyCategory';
    const requestBody = discrepancyCategory;
    console.log("POST Create DiscrepancyCategory", url, requestBody)
    return this.http.post<Response<number>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess || result.code === 3) {
        console.log("POST Create DiscrepancyCategory =>", result.data)
        discrepancyCategory.discrepancyCategoryID = result.data
        this.discrepancyCategoryCreated.next(discrepancyCategory);
        this.getDiscrepancyCategoryOptions();
      }
    });
  }


  getRateCellMaps(con1?, con2?) {
    const url = this.baseUrl + 'ratecellmap/GetRateCellMapList'

    const pageRequest = {
      pageIndex: con1.pageIndex ? con1.pageIndex : 0,
      pageSize: con1.pageSize ? con1.pageSize : 25,
      sortBy: con1.sortBy ? con1.sortBy : '',
      orderBy: con1.orderBy ? con1.orderBy : '',
    };

    const filters = {
      product: con2.mmis8200Product ? con2.mmis8200Product.trim() : con2.mmis8200Product,
      CCARateCell: con2.ccaRateCell ? con2.ccaRateCell.trim() : con2.ccaRateCell,
      MMISRateCell: con2.mmis8200RateCell ? con2.mmis8200RateCell.trim() : con2.mmis8200RateCell,
    };

    let requestBody = { ...pageRequest, ...filters };
    console.log("Get RateCell Map", url, requestBody)
    return this.http.post<Response<PagedList<RateCellMap>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log('Get RateCell Map =>', result.data)
        this.rateCellMapListChanged.next(result.data);
      }
    });
  }

  updateRateCellMap(rateCellMap: RateCellMap) {
    const requestBody = {
      CCARateCellID: rateCellMap.ccaRateCellID,
      activeFlag: rateCellMap.activeFlag
    };
    const rateCellMapId = rateCellMap.rateCellMapID;

    const url = this.baseUrl + 'ratecellmap/UpdateRateCellMapByID/' + rateCellMapId;

    console.log("PATCH Update RateCell Map", url, requestBody)
    return this.http.patch<Response<any>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log('PATCH Update RateCell Map =>', rateCellMap)
        this.rateCellMapUpdated.next(rateCellMap);
      }
    });
  }

  getRateCellUnmappedCount() {
    const url = this.baseUrl + 'ratecellmap/GetRateCellMapCount'

    console.log("GET RateCellUnmapped Count", url)
    return this.http.get<Response<{ count: number }>>(url, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("GET RateCellUnmappedCount =>", result.data.count)
        this.rateCellMapUnmappdCountGot.next(result.data.count);
      }
    });
  }

  getRegionMaps(con1?, con2?) {
    const url = this.baseUrl + 'regionmap/GetRegionMapList'

    const pageRequest = {
      pageIndex: con1.pageIndex ? con1.pageIndex : 0,
      pageSize: con1.pageSize ? con1.pageSize : 25,
      sortBy: con1.sortBy ? con1.sortBy : '',
      orderBy: con1.orderBy ? con1.orderBy : '',
    };

    const filters = {
      product: con2.mmis8200Product ? con2.mmis8200Product.trim() : con2.mmis8200Product,
      CCARegion: con2.ccaRegion ? con2.ccaRegion.trim() : con2.ccaRegion,
      MMISRegion: con2.mmis8200Region ? con2.mmis8200Region.trim() : con2.mmis8200Region
    };

    let requestBody = { ...pageRequest, ...filters };
    console.log("POST Get Region Map", url, requestBody)
    return this.http.post<Response<PagedList<RegionMap>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("POST Get Region Map", result.data)
        this.regionMapListChanged.next(result.data);
      }
    });
  }

  updateRegionMap(regionMap: RegionMap) {
    const requestBody = {
      CCARegionID: regionMap.ccaRegionID,
      activeFlag: regionMap.activeFlag
    };
    const regionMapID = regionMap.regionMapID;

    const url = this.baseUrl + 'regionmap/UpdateRegionMapByID/' + regionMapID;

    console.log("PATCH Update Region Map", url, requestBody)
    return this.http.patch<Response<any>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("PATCH Update Region Map =>", regionMap)
        this.regionMapUpdated.next(regionMap);
      }
    });
  }

  getRegionUnmappedCount() {
    const url = this.baseUrl + 'regionmap/GetRegionMapCount'

    console.log("GET Regionunmapped Count", url)
    return this.http.get<Response<{ count: number }>>(url, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("GET Regionunmapped Count =>", result.data.count)
        this.regionMapUnmappdCountGot.next(result.data.count);
      }
    });
  }

  getUserOptions() {
    const url = this.baseUrl + 'UserManagement/GetUserDropDownOptions'
    console.log("GET User Option", url)

    return this.http.get<Response<ResponseList<UserOption>>>(url, {
      observe: 'body',
      responseType: 'json'
    })
      .subscribe(result => {
        if (result.isSuccess) {
          console.log("GET User Option =>", result.data.list)
          this.userOptions = result.data.list
          this.userOptionsReady.next();
        }
      });
  }

  getUsers(con1?, con2?) {
    const url = this.baseUrl + 'UserManagement/GetUsersList'

    const pageRequest = {
      pageIndex: con1.pageIndex ? con1.pageIndex : 0,
      pageSize: con1.pageSize ? con1.pageSize : 25,
      sortBy: con1.sortBy ? con1.sortBy : '',
      orderBy: con1.orderBy ? con1.orderBy : '',
    };

    const filters = {
      UserID: con2.userID ? con2.userID : null,
      UserNameAD: con2.userNameAD ? con2.userNameAD.trim() : null,
    };

    let requestBody = { ...pageRequest, ...filters };
    console.log("Get Users", url, requestBody)
    return this.http.post<Response<PagedList<User>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("Get Users=>", result.data)
        this.userListChanged.next(result.data);
      }
    });
  }

  updateUser(user: User) {
    const userID = user.userID;
    // user.administrator = user.administrator ? 1 : 0;
    // user.specialist = user.specialist ? 1 : 0;
    // user.helpdesk = user.helpdesk ? 1 : 0;
    // user.supervisor = user.supervisor ? 1 : 0;
    const request = {
      UserNameAD: user.userNameAD,
      UserEmail: user.userEmail,
      UserFirstName: user.userFirstName,
      UserLastName: user.userLastName,
      RoleAdministrator: user.administrator,
      RoleHelpdesk: user.helpdesk,
      RoleSupervisor: user.supervisor,
      RoleSpecialist: user.specialist,
      ActiveFlag: 1
    }

    const url = this.baseUrl + 'UserManagement/UpdateUserByUserId/' + userID;
    console.log("PATCH Update User", url, request)
    return this.http.patch<Response<any>>(url, request, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("PATCH Update User=>", user)
        this.userUpdated.next(user);
        this.getUserOptions();
      }
    });
  }

  createUser(user: User) {
    user.administrator = user.administrator ? 1 : 0;
    user.specialist = user.specialist ? 1 : 0;
    user.helpdesk = user.helpdesk ? 1 : 0;
    user.supervisor = user.supervisor ? 1 : 0;

    const url = this.baseUrl + 'UserManagement/CreateNewUser/';
    const requestBody = user;
    console.log("POST Create User", url, requestBody)
    return this.http.post<Response<number>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess || result.code === 3) {
        console.log("POST Create User =>", user)
        user.userID = result.data
        this.userCreated.next(user);
        this.getUserOptions();
      }
    });
  }
}


