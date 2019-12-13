import { AuthService } from './../../auth/auth.service';
import { SettingService } from './../../setting/setting.service';
import { AssignmentService } from './../assignment.service';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
// import { ELEMENT_DATA, PeriodicElement, DisElement } from 'src/app/MOCK_DATA';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { of, Subscription, SubscriptionLike } from 'rxjs';
import { Member } from 'src/app/model/member.model';
import { PagedList } from 'src/app/model/response.model';
import { Discrepancy } from 'src/app/model/discrepancy.model';
import { SharedService } from 'src/app/shared/shared.service';
import { MemberService } from 'src/app/member/member.service';
import { MatSnackBar } from '@angular/material';
import { DiscrepancyStatusOption } from 'src/app/model/setting.model';

@Component({
  selector: 'app-assignment-info',
  templateUrl: './assignment-info.component.html',
  styleUrls: ['./assignment-info.component.css']
})
export class AssignmentInfoComponent implements OnInit, OnDestroy {
  // dataSource = ELEMENT_DATA[0];

  @ViewChild('reconList') reconView: ElementRef;

  /** sublist dimention parameter */
  contentHeight: number;
  contentWidth: number;

  // mock
  // memberMOCK: PeriodicElement;
  // mmis: number

  memebrLookingUP: boolean
  member: Member;
  masterPatientId: number
  actionUserId: number

  /** Sublist search form*/
  subForm: {
    CCAID: number,
    MMIS_ID: string,
    Name: number,
    includeResolved: boolean,
    hasComment: boolean
  }

  links = ['Monthly Summary', 'Discrepancy'];

  /** @input */
  activeLink = this.links[1];

  pagedSourceDiscrepancy: PagedList<Discrepancy>;

  private memberInfoChanged$: Subscription;
  private discrepancyListChanged$: Subscription;
  private discrepancyUpdated$: Subscription;
  private router$: Subscription;

  constructor(private route: ActivatedRoute,
    private memberService: MemberService,
    private sharedService: SharedService,
    private settingService: SettingService,
    private service: AssignmentService,
    private authService: AuthService,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.initSource();
    this.initState();
  }

  onNavigate(link) {
    this.activeLink = link;
    // this.router.navigate(link);
  }

  ngDoCheck() {
    // get sub-list height at every tick  
    this.contentHeight = this.reconView.nativeElement.offsetHeight;
    this.contentWidth = this.reconView.nativeElement.offsetHeight;
  }


  ngOnDestroy() {
    this.memberInfoChanged$.unsubscribe();
    this.discrepancyListChanged$.unsubscribe();
    this.discrepancyUpdated$.unsubscribe();
    this.router$.unsubscribe();
  }

  onDiscrepancyDetailClick(e) {
    this.service.onDiscrepancyDetailOpen(e);
  }


  initSource() {
    this.pagedSourceDiscrepancy = this.sharedService.getpagedListInl();
  }

  initState() {
    this.actionUserId = this.authService.getActionUserId();

    this.router$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => of(+params.get('id'))
      )).subscribe(value => {
        this.memebrLookingUP = true;
        this.masterPatientId = Number(value);
        // fetch MemebrInfo
        this.memberService.getMemberByPatientByID(this.masterPatientId);
        // assuming Discrepancy Is First Route
        this.initDiscrepancyByPatientID();
      });


    this.memberInfoChanged$ = this.memberService.memebrFetched.subscribe(data => {
      this.member = data
      this.memebrLookingUP = false;
      // console.log('MasterPatient Fetched', this.masterPatientId, this.member)
    })

    this.discrepancyListChanged$ = this.sharedService.disrepancySubListChanged.subscribe((result: PagedList<Discrepancy>) => {
      this.pagedSourceDiscrepancy = result;
    })

    /** After Individual Discrepancy Update  */
    this.discrepancyUpdated$ = this.sharedService.discrepancyUpdated.subscribe((discrepancys: Discrepancy[]) => {
      let rawPagedSource = { ...this.pagedSourceDiscrepancy };
      let discrepancyUpdated = discrepancys[0];
      let displayIndex;
      let assignchange;
      rawPagedSource.list.map((discrepnacy: Discrepancy) => {
        if (discrepnacy.discrepancyID != discrepancyUpdated.discrepancyID) {
          return discrepnacy;
        }
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

      // remove undisplayed row
      rawPagedSource.list = rawPagedSource.list.filter((discrepancy) =>
        discrepancy.discrepancyID !== displayIndex
      );

      // inline update triggered member fetch
      if (displayIndex || assignchange) {
        // console.log('inline update triggered member fetch')
        this.memberService.getMemberByMasterPatientId({ masterPatientId: discrepancyUpdated.masterPatientID, assigneeID: this.actionUserId })
      }

      // console.log(rawPagedSource);
      this.pagedSourceDiscrepancy = rawPagedSource;
      this.openSnackBar("Update Successed", "Dismiss")

    })
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
    });
  }

  initDiscrepancyByPatientID() {
    /** @Todo Seperate Main/Sub list in more elegant way  */
    this.sharedService.getDiscrepancies({ pageSize: 10 }, { MasterPatientID: this.masterPatientId, assigneeIDs: [this.actionUserId] }, true);
  }

  onListPagedSorted(e, type: string) {
    switch (type) {
      case 'discrepancy':
        /** @Todo Seperate Main/Sub list in more elegant way  */
        this.sharedService.getDiscrepancies(e, { MasterPatientID: this.masterPatientId, assigneeIDs: [this.actionUserId] }, true);
        break;

      default:
        break;
    }
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
    this.sharedService.getDiscrepancies(pageState, { ...this.subForm, ...{ MasterPatientID: this.masterPatientId, assigneeIDs: [this.actionUserId] } }, true);
  }

}
