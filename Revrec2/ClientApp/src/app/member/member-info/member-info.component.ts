import { Discrepancy } from './../../model/discrepancy.model';
import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Params } from '@angular/router';

// import { ELEMENT_DATA, PeriodicElement, DisElement } from 'src/app/MOCK_DATA';
import { switchMap, delay, tap, } from 'rxjs/operators';
import { of, Subscription, Observable } from 'rxjs';
import { Content } from '@angular/compiler/src/render3/r3_ast';
import { MemberService } from '../member.service';
import { Member } from 'src/app/model/member.model';
import { PagedList } from 'src/app/model/response.model';
import { MatSnackBar } from '@angular/material';
import { SharedService } from 'src/app/shared/shared.service';
import { SettingService } from 'src/app/setting/setting.service';
import { DiscrepancyStatusOption } from 'src/app/model/setting.model';
import { UserOption } from 'src/app/model/user.model';

@Component({
  selector: 'app-member-info',
  templateUrl: './member-info.component.html',
  styleUrls: ['./member-info.component.css'],
})
export class MemberInfoComponent implements OnInit, OnDestroy {
  // MOCK
  // dataSource = ELEMENT_DATA[3];

  @ViewChild('reconList') reconView: ElementRef;

  /** sublist dimention parameter */
  contentHeight: number;
  contentWidth: number;
  memebrInfoShrink: boolean = false;

  //mock
  mmis

  memebrLookingUP: boolean
  member: Member;
  masterPatientId: number

  /** Sublist search form*/
  subForm: {
    CCAID: number,
    MMIS_ID: string,
    Name: number,
    includeResolved: boolean,
    hasComment: boolean
  }

  links = ['Discrepancy', 'Monthly Summary'];
  /** @input */
  activeLink = this.links[0];

  pagedSourceDiscrepancy: PagedList<Discrepancy>;

  private memberInfoChanged$: Subscription;
  private discrepancyListChanged$: Subscription;
  private discrepancyUpdated$: Subscription;

  private discrepancyBulkUpdated$: Subscription
  // private memberDiscrepancyBulkUpdated$: Subscription;

  constructor(private route: ActivatedRoute,
    private service: MemberService,
    private sharedService: SharedService,
    private settingService: SettingService,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.initSource();
    this.initState();
  }

  ngDoCheck() {
    // get sub-list height at every tick  
    // if (this.isMemebrDetail() && this.reconView) {
    this.contentHeight = this.reconView.nativeElement.offsetHeight;
    this.contentWidth = this.reconView.nativeElement.offsetHeight;
    // }
  }

  ngOnDestroy() {
    this.memberInfoChanged$.unsubscribe();
    this.discrepancyListChanged$.unsubscribe();
    this.discrepancyUpdated$.unsubscribe();

    // this.discrepancyBulkUpdated$.unsubscribe();
    // this.memberDiscrepancyBulkUpdated$.unsubscribe();
  }

  initSource() {
    this.pagedSourceDiscrepancy = this.service.getpagedListInl();
  }

  initState() {
    /** Router Pipe */
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => of(+params.get('id'))
      )).subscribe(value => {
        this.memebrLookingUP = true;
        this.masterPatientId = Number(value);
        // fetch MemebrInfo
        this.service.getMemberByPatientByID(this.masterPatientId);
        // assume Discrepancy Is First Route
        this.initDiscrepancyByPatientID();
      });


    /** Member Info $ */
    this.memberInfoChanged$ = this.service.memebrFetched.subscribe(data => {
      this.member = data
      this.memebrLookingUP = false;
      // console.log('MasterPatient Fetched', this.masterPatientId, this.member)
    })

    /** Discrepancy List Changed $ */
    this.discrepancyListChanged$ = this.service.sharedService.disrepancySubListChanged.subscribe((result: PagedList<Discrepancy>) => {
      this.pagedSourceDiscrepancy = result;
    })

    /** Discrepancy Item In-line Updated $ */
    this.discrepancyUpdated$ = this.sharedService.discrepancyUpdated.subscribe((discrepancys: Discrepancy[]) => {
      let rawPagedSource = { ...this.pagedSourceDiscrepancy };
      let discrepancyUpdated = discrepancys[0];
      let displayIndex;
      let assignchange;
      rawPagedSource.list.map((discrepnacy: Discrepancy) => {
        if (discrepnacy.discrepancyID != discrepancyUpdated.discrepancyID) {
          return discrepnacy;
        }
        // console.log(discrepnacy === discrepancyUpdated)

        // assignChanged
        // console.log(discrepnacy, discrepancyUpdated.assigned_UserID, discrepnacy.assigned_UserID !== discrepancyUpdated.assigned_UserID)
        assignchange = discrepancys[1].assigned_UserID !== discrepancyUpdated.assigned_UserID;

        // status.display
        let discrepancyStatusUpdated = this.settingService.getOptions('discrepancyStatus').find((discrepancyStatusOption: DiscrepancyStatusOption) =>
          discrepancyStatusOption.discrepancyStatusID === discrepancyUpdated.discrepancyStatusID)
        let isDIsplayed = discrepancyStatusUpdated ? discrepancyStatusUpdated.discrepancyCategoryDisplay : true;

        if (!isDIsplayed) {
          displayIndex = discrepnacy.discrepancyID;
          //rawPagedSource.count--
        }

        discrepnacy = { ...discrepancyUpdated };
        return discrepnacy;

      });

      // console.log(displayIndex)
      // remove undisplayed row

      rawPagedSource.list = rawPagedSource.list.filter((discrepancy) =>
        discrepancy.discrepancyID !== displayIndex
      );

      // inline update triggered member fetch
      if (displayIndex || assignchange) {
        // console.log('inline update triggered member fetch')
        this.service.getMemberByMasterPatientId({ masterPatientId: discrepancyUpdated.masterPatientID })
      }

      // console.log(rawPagedSource);
      this.pagedSourceDiscrepancy = rawPagedSource;
      this.openSnackBar("Update Successed", "Dismiss")

    })
  }


  onNavigate(link) {
    this.activeLink = link;
    // this.router.navigate(link);
  }

  onDiscrepancyDetailClick(e: any) {
    this.service.onDiscrepancyDetailOpen(e);
  }


  initDiscrepancyByPatientID() {
    /** @Todo Seperate Main/Sub list in more elegant way  */
    this.service.sharedService.getDiscrepancies({ pageSize: 25 }, { MasterPatientID: this.masterPatientId }, true);
  }

  onListPagedSorted(e, type: string) {
    switch (type) {
      case 'discrepancy':
        /** @Todo Seperate Main/Sub list in more elegant way  */
        this.service.sharedService.getDiscrepancies(e, { ...this.subForm, ...{ MasterPatientID: this.masterPatientId } }, true);
        break;

      default:
        break;
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
    });
  }

  onLocalSearch(e) {
    const pageState = {
      orderBy: e.orderBy,
      pageIndex: e.pageIndex,
      pageSize: e.pageSize,
      sortBy: e.sortBy,
    }
    this.subForm = {
      CCAID: e.CCAID,
      MMIS_ID: e.MMIS_ID,
      Name: e.Name,
      hasComment: e.hasComment,
      includeResolved: e.includeResolved,
    }
    /** @Todo Seperate Main/Sub list in more elegant way  */
    this.sharedService.getDiscrepancies(pageState, { ...this.subForm, ...{ MasterPatientID: this.masterPatientId } }, true);
  }

  isMemebrDetailShowing() {
    return this.service.isMemberDetailShowing();
  }
}
