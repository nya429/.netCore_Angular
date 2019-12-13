import { NotificationService } from './../../notification.service';
import { SharedService } from 'src/app/shared/shared.service';
import { AuthService } from './../../auth/auth.service';
import { MemberService } from './../../member/member.service';
import { AssignmentService } from './../assignment.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { PagedList } from 'src/app/model/response.model';
import { MemberPaged, Member } from 'src/app/model/member.model';
import { SelectionModel } from '@angular/cdk/collections';
import { SettingService } from 'src/app/setting/setting.service';
import { filter } from 'rxjs/operators';
import { NavigationService } from 'src/app/navigation/navigation.service';
import { Notification } from './../../model/notification.model';
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
   public displayedDiscrepancy
   //: DisElement;

  pagedSource: PagedList<MemberPaged>;
  isLookup: boolean;

  // Bulk Selection;
  memberSelection: SelectionModel<Member>;

  // MemebrInfo 
  public selectedMMIS: number;
  public detailShowing: boolean;

  // NotificationUnreadState
  public unreadMemberIds: number[] = [];
  public unreadDiscrepancyIds: number[] = [];
  public unreadCommentIds: number[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private service: AssignmentService,
    private settingService: SettingService,
    private navService: NavigationService,
    private notificationService: NotificationService,
    private sharedService: SharedService,
    private authService: AuthService,
    private memberService: MemberService
  ) {
    this.actionUserId = this.authService.getActionUserId();
  }

  ngOnInit() {
    this.getChildParams();
    this.onMemberInfoSelect();
    this.initState()
    this.initSource();

    if (this.navService.hasNavData()) {
      this.onNotificationNav();
    } else if (localStorage.getItem('worklist')) {
      let masterPatientID = localStorage.getItem('worklist');
      this.router.navigate(['/worklist', { outlets: { 'bio': [masterPatientID] } }]);
    }
  }

  ngOnDestroy() {
    this.unsubcribeSubscriptions();

    if (this.selectedMMIS) {
      localStorage.setItem('worklist', this.selectedMMIS.toString());
    }

  }

  getChildParams(): void {
    this.selectedMMIS = this.route.firstChild
      ? +this.route.firstChild.snapshot.paramMap.get('id')
      : null;
    console.log(this.selectedMMIS);
  }

  onMemberInfoSelect(): void {
    this.detailShowing = !!this.selectedMMIS;
  }

  initState() {
    this.displayedDiscrepancyInfo$ = this.service.onDiscrepancyDetailOpened.subscribe((e) => {
      this.displayedDiscrepancy = e;
    })

    this.router$ = this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
    ).subscribe(() => {
      this.getChildParams()
      this.onMemberInfoSelect();
      if (this.navService.hasNavData()) {
        this.onNotificationNav();
      }

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

  onNotificationNav() {
    const notification = this.navService.onNaved() as Notification
    console.log('onNav', notification)
    switch (notification.NotificationType) {
      case 'member':
        return;
      case 'comment':
     
        return;
      case 'discrepancy':
     
        return;
      default:
        return;
    }

  }

}
