import { SharedService } from 'src/app/shared/shared.service';
import { AuthService } from './../../auth/auth.service';
import { MemberService } from './../../member/member.service';
import { AssignmentService } from './../assignment.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { DisElement } from 'src/app/MOCK_DATA';
import { PagedList } from 'src/app/model/response.model';
import { MemberPaged, Member } from 'src/app/model/member.model';
import { SelectionModel } from '@angular/cdk/collections';
import { SettingService } from 'src/app/setting/setting.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-assignment-container',
  templateUrl: './assignment-container.component.html',
  styleUrls: ['./assignment-container.component.css']
})
export class AssignmentContainerComponent implements OnInit, OnDestroy {
  private displayedDiscrepancyInfo$: Subscription;
  private memberListChanged$: Subscription;
  private afterDiscrepancyBulkUpdated$: Subscription;
  private router$: Subscription;

  public actionUserId

  // onDisplayDiscrepancy
  // MOCK
  public displayedDiscrepancy: DisElement;

  pagedSource: PagedList<MemberPaged>;
  isLookup: boolean;

  // Bulk Selection;
  memberSelection: SelectionModel<Member>;

  // MemebrInfo 
  public selectedMMIS: number;
  public detailShowing: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private service: AssignmentService,
    private settingService: SettingService,
    private sharedService: SharedService,
    private authService: AuthService,
    private memberService: MemberService
  ) {
    this.actionUserId = this.authService.getActionUserId();
    console.log('AssignmentContainerComponent.Action_User_ID:', this.actionUserId)
  }

  ngOnInit() {
    this.getChildParams();
    this.onMemberInfoSelect();
    this.initState()
    this.initSource();
  }

  ngOnDestroy() {
    this.unsubcribeSubscriptions();
  }

  getChildParams(): void {
    this.selectedMMIS = this.route.firstChild
      ? +this.route.firstChild.snapshot.paramMap.get('id')
      : null;
  }

  onMemberInfoSelect(): void {
    this.detailShowing = !!this.selectedMMIS;
  }

  initState() {
    this.displayedDiscrepancyInfo$ = this.service.onDiscrepancyDetailOpened.subscribe((e: DisElement) => {
      this.displayedDiscrepancy = e;
    })

    this.router$ = this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
    ).subscribe(() => {
      this.getChildParams()
      this.onMemberInfoSelect();
    });

    this.memberListChanged$ = this.memberService.memberListChanged.subscribe((result: PagedList<MemberPaged>) => {
      this.isLookup = false;
      this.pagedSource = result;
    });

    // On Discrepancy Bulk Update Successed
    this.afterDiscrepancyBulkUpdated$ = this.sharedService.afterDiscrepancyBulkUpdated.subscribe((form) => {
      console.log('After_Discrepancy_Bulk_Updated', form);


      setTimeout(() => {
        this.memberService.getMemberByMasterPatientId({ ...form, ...{ assigneeID: this.actionUserId } })
      }, 1000);
    })
  }

  onDiscrepancyDetailDismissed() {
    this.service.onDiscrepancyDetailClose();
  }

  unsubcribeSubscriptions() {
    this.displayedDiscrepancyInfo$.unsubscribe();
    this.memberListChanged$.unsubscribe();
    this.afterDiscrepancyBulkUpdated$.unsubscribe();
    this.router$.unsubscribe();
  }

  onListPagedSorted(e) {
    this.memberService.getMembers({ ...e, ...{ assigneeID: this.actionUserId } });
  }

  initSource() {
    this.pagedSource = this.memberService.getpagedListInl();
    this.isLookup = true;
    
    this.memberService.getMembers({
      sortBy: 'maxAging',
      orderBy: 1,
      assigneeID: this.actionUserId
    });
  }

}
