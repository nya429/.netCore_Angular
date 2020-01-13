import { AuthService } from './../../auth/auth.service';
import { SharedService } from './../../shared/shared.service';
import { Member, MemberName } from 'src/app/model/member.model';
import { SettingService } from 'src/app/setting/setting.service';
import { MemberPaged } from './../../model/member.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { ParamMap, ActivatedRoute, UrlSegment, RouterState, Router, NavigationEnd } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog, MatSnackBar } from '@angular/material';

import { of, Subscription, } from 'rxjs';
import { switchMap, filter, map } from 'rxjs/operators';

// import { PeriodicElement, ELEMENT_DATA, DisElement } from 'src/app/MOCK_DATA';
import { MemberService } from './../member.service';
import { DiscreapcnyUpdateDialogComponent } from './../../shared/discrepancy-update-dialog/discrepancy-update-dialog.component';
import { PagedList } from 'src/app/model/response.model';
import { UserOption } from 'src/app/model/user.model';
import { DiscrepancyStatusOption } from 'src/app/model/setting.model';
import { NavigationService } from 'src/app/navigation/navigation.service';

@Component({
  selector: 'app-member-container',
  templateUrl: './member-container.component.html',
  styleUrls: ['./member-container.component.css'],
  // animations: [
  //   trigger('detail', [
  //     transition(':leave', [
  //       style({ opacity: 1, transform: 'translateY(0)', }),
  //       animate(200, style({ opacity: 0, transform: 'translateY(5%)', })),
  //     ]),
  //   ]),
  // ],
})
export class MemberContainerComponent implements OnInit, OnDestroy {
  private displayedDiscrepancyInfo$: Subscription;
  private memberListChanged$: Subscription;
  // private singleMemberListFetch$: Subscription;
  private memberDiscrepancyBulkUpdated$: Subscription;
  private afterDiscrepancyBulkUpdated$: Subscription;
  private dialogClose$: Subscription;
  private router$: Subscription;

  // Members Paged Data Source
  // MOCK
  // private dataSource: PeriodicElement[] = ELEMENT_DATA;
  pagedSource: PagedList<MemberPaged>;
  isLookup: boolean;

  // MemebrInfo 
  public selectedMMIS: number;
  public detailShowing: boolean;

  // Bulk Selection;
  memberSelection: SelectionModel<Member>;

  // onDisplayDiscrepancy
  public displayedDiscrepancy: any;

  /** Authorization */
  listPermissions: string;
  infoPermissions: string;
  bulkMemberUpdatePermissions: string;
  bulkMemberUpdateByFilterPermissions: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private service: MemberService,
    private authService: AuthService,
    private navService: NavigationService,
    private settingService: SettingService) {
    this.listPermissions = this.authService.getRoleMappingSettingByNames('member', 'GetMemberListByConAsync');
    this.infoPermissions = this.authService.getRoleMappingSettingByNames('member', 'GetMemberInfoByConAsync');
    this.bulkMemberUpdatePermissions = this.authService.getRoleMappingSettingByNames('member', 'UpdateDiscrepancyForMultipleMembersByConAsync');
    this.bulkMemberUpdateByFilterPermissions = this.authService.getRoleMappingSettingByNames('member', 'UpdateMultipleDiscrepanciesBYFiltersByConAsync');
  }

  ngOnInit(): void {
    this.getChildParams();
    this.onMemberInfoSelect();
    this.initState()
    this.initSource();
  }

  ngOnDestroy() {
    this.unsubcribeSubscriptions();
  }
  // 
  getChildParams(): void {
    this.selectedMMIS = this.route.firstChild
      ? +this.route.firstChild.snapshot.paramMap.get('id')
      : null;
  }

  onMemberDetailToggle(): void {
    this.detailShowing = !this.detailShowing;
    this.service.onMemberDetailToggle(this.detailShowing);
  }

  // after router detected
  onMemberInfoSelect(): void {
    this.detailShowing = !!this.selectedMMIS;
  }

  onMemberSelected(selection: SelectionModel<Member>): void {
    this.memberSelection = selection;
    // console.log(selection)
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DiscreapcnyUpdateDialogComponent, {
      height: '500px',
      width: '400px',
      data: { selection: this.memberSelection, type: 'member', formOptions: this.settingService.getDiscrepancyBulkUpdateFormOptions() }
    });

    this.dialogClose$ = dialogRef.afterClosed().subscribe((form) => {
      if (!form || form === null)
        return;

      form.MemberIds = this.memberSelection.selected.map((member: Member) => member.masterPatientID);
      this.openSnackBar(`${this.memberSelection.selected.length} Memebr Update Sucessfully`, 'Dismiss');

      this.service.bulkUpdateMemberDiscrepancyByIds(form);
      this.memberSelection.clear();
    })
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1500,
    });
  }

  initState() {
    this.displayedDiscrepancyInfo$ = this.service.onDiscrepancyDetailOpened.subscribe((e: any) => {
      this.displayedDiscrepancy = e;
    })

    this.router$ = this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
    ).subscribe(() => {
      this.getChildParams()
      this.onMemberInfoSelect();
      this.onUniversalNav();
    });

    this.memberListChanged$ = this.service.memberListChanged.subscribe((result: PagedList<MemberPaged>) => {
      this.isLookup = false;
      this.pagedSource = result;
    });

    // On Memeber Bulk Update Successed
    this.memberDiscrepancyBulkUpdated$ = this.service.memberDiscrepancyBulkUpdated.subscribe((form:
      {
        MemberIds: number[],
        Assigned_User: UserOption,
        DueDate: any,
        DiscrepancyStatus: DiscrepancyStatusOption,
        DiscrepancyComment: string
      }) => {
      let rawPagedSource = { ...this.pagedSource };
      rawPagedSource.list = rawPagedSource.list.map((memberPaged: MemberPaged) => {

        // Assignee BulkUpdate
        if (form.MemberIds.includes(memberPaged.masterPatientID) && form.Assigned_User) {
          memberPaged.totalAssigned = memberPaged.totalDiscrepancies;

        }

        // Status BulkUpdate
        if (form.MemberIds.includes(memberPaged.masterPatientID) && form.DiscrepancyStatus && !form.DiscrepancyStatus.discrepancyCategoryDisplay) {
          memberPaged.totalDiscrepancies = 0;
          memberPaged.totalAssigned = 0;
          memberPaged.maxAging = 0;
          memberPaged.absoluteVarianceSum = 0;
          rawPagedSource.count--
        }

        if (this.selectedMMIS === memberPaged.masterPatientID) {

        }

        return memberPaged;
      });
      this.pagedSource = rawPagedSource;


      this.openSnackBar(`${form.MemberIds.length} Memebrs Update Sucessfully`, 'Dismiss');
    });

    // On Discrepancy Bulk Update Successed
    this.afterDiscrepancyBulkUpdated$ = this.service.sharedService.afterDiscrepancyBulkUpdated.subscribe((form) => {
      setTimeout(() => {
        console.log('On Discrepancy Bulk Update Successed => getMemberByMasterPatientId', form);
        this.service.getMemberByMasterPatientId(form)
      }, 1000);
    })

    // this.singleMemberListFetch$ = this.service.singleMemberListFetch.subscribe((memberupdated: MemberPaged) => {
    //   // let rawPagedSource = { ...this.pagedSource };
    //   // rawPagedSource.list = rawPagedSource.list.map((memberPaged: MemberPaged) => {
    //   //   return memberPaged;
    //   // })

    //   console.log('singleMemberListFetch', memberupdated);
    // });
  }


  initSource() {
    this.pagedSource = this.service.getpagedListInl();
    this.isLookup = true;

    console.log('initSource')
    if (this.navService.hasNavData()) {
      this.onUniversalNav();
    } else {
      this.service.getMembers({
        sortBy: 'absoluteVarianceSum',
        orderBy: 1
      });
    }

  }

  unsubcribeSubscriptions() {
    this.displayedDiscrepancyInfo$.unsubscribe();
    this.memberListChanged$.unsubscribe();
    this.memberDiscrepancyBulkUpdated$.unsubscribe();
    this.afterDiscrepancyBulkUpdated$.unsubscribe();
    this.router$.unsubscribe();
    // this.singleMemberListFetch$.unsubscribe();
    if (this.dialogClose$) {
      this.dialogClose$.unsubscribe();
    }
  }

  onDiscrepancyDetailDismissed() {
    this.service.onDiscrepancyDetailClose();
  }

  onListPagedSorted(e) {
    this.service.getMembers(e);
  }

  onUniversalNav() {
    console.log('onNav')
    if (!this.navService.hasNavData())
      return;

    let data = this.navService.onNaved() as MemberName
    console.log(data)
    this.isLookup = true;
    this.service.getMembers({
      sortBy: 'absoluteVarianceSum',
      orderBy: 1,
      includeZeroDiscrepancy: 1,
      MasterPatientID: data.masterPatientID.toString()
    });

  }
}
