import { Notification } from './../../model/notification.model';
import { AuthService } from './../../auth/auth.service';
import { Discrepancy } from './../../model/discrepancy.model';
import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, Output, EventEmitter, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Sort, MatSnackBar, MatDialog, PageEvent, MatSortable, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { deepIsEqual } from './../../util/deepIsEqual';
// import { PeriodicElement, ELEMENT_DATA, DisElement } from 'src/app/MOCK_DATA';
import { DiscreapcnyUpdateDialogComponent } from '../discrepancy-update-dialog/discrepancy-update-dialog.component';
import { SharedService } from '../shared.service';
import { Subscription } from 'rxjs';
import { PagedList } from 'src/app/model/response.model';
import { minLenValidator, execLenValidator } from '../date.validate.directive';
import { SettingService } from 'src/app/setting/setting.service';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { DiscrepancyStatusOption } from 'src/app/model/setting.model';
import { stringify } from '@angular/compiler/src/util';
import { UserOption } from 'src/app/model/user.model';
import { listItemSlideStateTrigger } from 'src/app/setting/setting.animation';
import { MemberService } from 'src/app/member/member.service';
import { NotificationService } from 'src/app/notification.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

const moment = _rollupMoment || _moment;

const ColumnsSetting: string[] = [
  'select',
  'memberName',
  'mmiS_MMIS_ID',
  'ccaid',
  'product',
  'memberMonth',
  'ccaRateCell',
  'ccaRegion',
  'ccaAmount',
  'ccaPatientPay',
  'ccaPatientSpendDown',
  'mmisRateCell',
  'mmisRegion',
  'mmisAmount',
  'mmisPatientPay',
  'mmisPatientSpendDown',
  'variance',
  'flag',
  'discrepancyStatus',
  'assigned_UserName',
  'dueDate',
  'insertDate',
  'actions'
]

@Component({
  selector: 'app-discrepancy-list',
  templateUrl: './discrepancy-list.component.html',
  styleUrls: ['./discrepancy-list.component.css'],
  animations: [listItemSlideStateTrigger,
    // trigger('detailExpand', [
    //   state('collapsed', style({height: '0px', minHeight: '0'})),
    //   state('expanded', style({height: '*'})),
    //   transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    // ]),

  ]
})
export class DiscrepancyListComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('table') private tableContainer: ElementRef;
  @ViewChild(MatSort) sort: MatSort;

  /** Table Container State: @Input */
  @Input() containerH: number;
  @Input() isSubList: boolean;
  @Input() mockMSR: boolean;
  @Input('isLookup') containerSourceLookUp: boolean;


  @Output() onDiscrepancyDetailClicked = new EventEmitter<any>();
  @Output() onPagedAndSorted = new EventEmitter<any>();
  @Output() onLocalSearch = new EventEmitter<any>();
  @Output() onUpdated = new EventEmitter<Discrepancy[]>();

  /** Table Column State */
  displayedColumns: string[] = ColumnsSetting.slice();

  /** Table Source State: @Input */
  @Input() source: any[];

  private actionUserId: number;

  private testSlideState: boolean;

  private _dateSourcePaged: PagedList<Discrepancy>;
  expandedElement: Discrepancy | null;

  @Input('sourcePaged')
  set dateSourcePaged(dateSourcePaged: PagedList<Discrepancy>) {
    console.log('SOURCE PAGED SET')
    this._dateSourcePaged = dateSourcePaged;
    this.pagedData = [...this._dateSourcePaged.list];
    this.pageState.count = this.dateSourcePaged.count;
    this.pageState.pageSize = this.dateSourcePaged.pageSize;
    this.pageState.pageIndex = this.dateSourcePaged.pageIndex;
    this.isLookup = false;
    this.showCommentary = false;
    this.selection.clear();
    this.onNotificationClicked();
  };

  get dateSourcePaged(): PagedList<Discrepancy> {
    return this._dateSourcePaged;
  }

  private _masterPatientId: number;
  @Input('masterPatientId')
  set masterPatientId(masterPatientId: number) {
    this._masterPatientId = masterPatientId;
    this.showCommentary = false;
    this.testSlideState = false;
  };

  get masterPatientId(): number {
    return this._masterPatientId;
  }

  private searchForm$: Subscription;

  private discrepancyBulkUpdated$: Subscription;
  private memberDiscrepancyBulkUpdated$: Subscription;
  private dialogClose$: Subscription;
  private notification$: Subscription;

  // //MOCK 
  // dataSource = ELEMENT_DATA[0].discrepancies;
  // //MOCK 
  // sortedData = this.dataSource;

  pagedData: Discrepancy[] = [];



  /** loading flag, default false */
  isLookup = false;

  /**  Selection State
   *     1. member multiple selection
  */
  selection = new SelectionModel<Discrepancy>(true, []);

  /** pagination State 
   *  data.Source.lenth will be used only for the first time
   *  pageIndex
   *  pageSize
   *  sortCloumn
   *  sortDirection
   *  pageSizeOptions
  */

  pageSizeOptions: number[] = [15, 25, 50, 100];
  pageState = {
    count: 0,
    pageIndex: 0,
    pageSize: 15,
    sortBy: "",
    orderBy: 0
  }

  /** 
   * Temp Local Form 
   * 
*/
  // myControl = new FormControl();
  // statusOptions: string[] = ['new', 'Resolution expected from change to MP', 'Appeal denied by Medicaid',
  //   'Ready for write-off by CCA', 'Resolution expected via Medicaid 820, Quarterly',
  //   'At Medicaid for eligibility reinstatement', 'Contacting Member (Demographics Verification)',
  //   'At Medicaid For Appeal', 'Clinical Ops- Expired MDS'];

  // userOptions: string[] = ['Yue Song', 'Jonathan Lewis', 'Nicholas Frenette', 'Remo Andrade', 'Alain Alsina'
  //   , 'Veronica Marin', 'Leslie Alvarez', 'Albany Ortiz'];


  /** Commentary Section State */
  showCommentary: boolean = false;
  selectDiscrepancyID: number;
  selectMasterPatientID: number;
  selectDiscrepancy: Discrepancy;

  /** Edit Section State MOCK*/
  // editedElement: DisElement;
  // editedField: string;
  datePcikerOpened: boolean;

  /**  Local Form  */
  searchForm: FormGroup;
  searchTimer;

  /** default sort */
  defaultSort: MatSortable = {
    id: '',
    start: 'asc',
    disableClear: true
  };

  /** In-line editing */
  editedElement: Discrepancy;
  editedElementPrev: Discrepancy;
  editedElementNext: Discrepancy;
  editedField: string;
  selectObject: any = null;

  /** Authorization */
  updatePermissions: string;
  infoPermissions: string;
  bulkUpdatePermissions: string;
  bulkUpdateFilterPermissions: string;
  commentPermissions: string;

  constructor(private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private service: SharedService,
    private settingService: SettingService,
    private memberService: MemberService,
    private authService: AuthService,
    private notificationService: NotificationService,
    public dialog: MatDialog) {
    this.updatePermissions = this.authService.getRoleMappingSettingByNames('discrepancy', 'UpdateDiscrepancyByIDAsync');
    this.infoPermissions = this.authService.getRoleMappingSettingByNames('discrepancy', 'GetDiscrepancyByIdByConAsync');
    this.bulkUpdatePermissions = this.authService.getRoleMappingSettingByNames('discrepancy', 'UpdateMultipleDiscrepanciesByIdListByConAsync');
    this.bulkUpdateFilterPermissions = this.authService.getRoleMappingSettingByNames('discrepancy', 'UpdateMultipleDiscrepanciesByFiltersByConAsync');
    this.commentPermissions = this.authService.getRoleMappingSettingByNames('discrepancy', 'GetDiscrepancyCommentListByIdByConAsync');
  }

  ngOnInit() {
    this.initForm();
    this.onStateInit();
  }

  onStateInit() {
    this.actionUserId = this.authService.getActionUserId();

    // sub-list will not including member-info
    if (this.masterPatientId && !this.mockMSR) {
      this.displayedColumns.splice(1, 4);
      this.displayedColumns.splice(2, 10);
    } else {
      this.displayedColumns.splice(17, 1);
    }

    if (!this.isAuthorized('bulk_update')) {
      this.displayedColumns.shift();
    }

    if (!this.isAuthorized('commnet') && !this.isAuthorized('explore')) {
      this.displayedColumns.pop();
    }

    this.notification$ = this.notificationService.notificationClicked.subscribe(n => {
      this.onNotificationClicked();
    });

    this.searchForm$ = this.searchForm.valueChanges.subscribe(() => this.onSearch());

    // this.discrepancyBulkUpdated$ = this.service.discrepancyBulkUpdated.subscribe((form: {
    //   discrepancyIDs: number[],
    //   Assigned_User: UserOption,
    //   DueDate: any,
    //   DiscrepancyStatus: DiscrepancyStatusOption,
    //   DiscrepancyComment: string,
    // }) => {
    //   // this.pagedData.map((discrepancy: Discrepancy) = {
    //   //   if(discrepancy)
    //   // })
    //   this.openSnackBar(`${form.discrepancyIDs.length} Discrepancy Update Sucessfully`, 'Dismiss');
    // });


    /** Memebr List bulk updated that afect selected member in Discrepancy List  */
    this.memberDiscrepancyBulkUpdated$ = this.memberService.memberDiscrepancyBulkUpdated.subscribe((form:
      {
        MemberIds: number[],
        Assigned_User: UserOption,
        DueDate: any,
        DiscrepancyStatus: DiscrepancyStatusOption,
        DiscrepancyComment: string
      }) => {
      if (form.MemberIds.includes(this.masterPatientId)) {
        this.refreshDiscreapncyOnBulkUpdated();
      }
    });

    /** Discrepancy List bulk updated */
    this.discrepancyBulkUpdated$ = this.service.discrepancyBulkUpdated.subscribe((form:
      {
        discrepancyIDs: number[],
        Assigned_User: UserOption,
        DueDate: any,
        DiscrepancyStatus: DiscrepancyStatusOption,
        DiscrepancyComment: string
      }) => {

      // console.log('discrepancyBulkUpdated$', form.DiscrepancyStatus);

      let unDisplayedIds: number[] = [];

      //bulk update list based on form
      this.pagedData.map((discrepnacy: Discrepancy, index: number) => {
        if (!form.discrepancyIDs.includes(discrepnacy.discrepancyID)) {
          return discrepnacy;
        }

        // update status
        discrepnacy.discrepancyStatus = form.DiscrepancyStatus ? form.DiscrepancyStatus.discrepancyStatus : discrepnacy.discrepancyStatus;
        discrepnacy.discrepancyStatusID = form.DiscrepancyStatus ? form.DiscrepancyStatus.discrepancyStatusID : discrepnacy.discrepancyStatusID;
        // update user
        discrepnacy.assigned_UserID = form.Assigned_User ? form.Assigned_User.userID : discrepnacy.assigned_UserID;
        discrepnacy.assigned_UserName = form.Assigned_User ? form.Assigned_User.userNameAD : discrepnacy.assigned_UserName;
        // update duedate
        discrepnacy.dueDate = form.DueDate ? form.DueDate : discrepnacy.dueDate;

        // push discrepancyId if not display
        if (form.DiscrepancyStatus && !form.DiscrepancyStatus.discrepancyCategoryDisplay) {
          unDisplayedIds.push(discrepnacy.discrepancyID);
        }
        return discrepnacy;
      });

      // remove undisplayed row
      /** @todo count-- size-- */
      // console.log('UNDISPLAY', unDisplayedIds)

      const undisplayed = this.pagedData.filter(discrepancy =>
        unDisplayedIds.includes(discrepancy.discrepancyID)
      );

      //  TODO add discreapncies ----------------------------------------------
      this.service.onAfterDiscrepancyBulkUpdated(
        {
          masterPatientId: this.masterPatientId,
          // staticount: {
          //   total: 0
          //   assinged: form.discrepancyIDs.length,
          //   // age: form.DiscrepancyStatus.discrepancyCategoryDisplay ? 
          //   variance: form.DiscrepancyStatus.discrepancyCategoryDisplay ? 0 :
          //     undisplayed.map(d => d.variance).reduce((a, b) =>
          //       Math.abs(a) + Math.abs(b))

          // }
        }
      );
      // ----------------------------------------------


      this.pagedData = this.pagedData.filter(discrepancy =>
        // !unDisplayedIds.includes(discrepancy.discrepancyID)
        !undisplayed.includes(discrepancy)
      );

      if (unDisplayedIds.length > 0) {
        setTimeout(() => {
          // console.log('refresh discrepacny list')
          this.refreshDiscreapncyOnBulkUpdated();
        }, 800);


      }

      this.openSnackBar(`${form.discrepancyIDs.length} Discrepancy Bulk Update Sucessfully`, 'Dismiss');
    });
  }

  refreshDiscreapncyOnBulkUpdated() {
    this.testSlideState = false;
    this.isLookup = true;
    this.pageState.pageIndex = 0;
    this.onPagedAndSorted.emit(this.pageState);
  }

  initForm() {
    this.searchForm = new FormGroup({
      Name: new FormControl('', {
        validators: minLenValidator(3)
      }),
      CCAID: new FormControl('', {
        validators: execLenValidator(10)
      }),
      MMIS_ID: new FormControl('', {
        validators: execLenValidator(12)
      }),
      includeResolved: new FormControl(''),
      hasComment: new FormControl(''),
    });
  }

  ngOnDestroy() {
    this.discrepancyBulkUpdated$.unsubscribe();
    this.searchForm$.unsubscribe();
    this.memberDiscrepancyBulkUpdated$.unsubscribe();
    // this.notification$.unsubscribe();
    if (this.dialogClose$) {
      this.dialogClose$.unsubscribe();
    }
  }

  ngOnChanges() { }

  onPage(e: PageEvent): void {
    this.isLookup = true;
    this.pageState.pageIndex = e.pageIndex;
    this.pageState.pageSize = e.pageSize;
    this.onPagedAndSorted.emit(this.pageState);

    /** @todo */
    this.testSlideState = false;
  }

  onSort(e: Sort): void {
    this.isLookup = true;
    this.pageState.sortBy = e.direction ? e.active : null;
    this.pageState.orderBy = e.direction ? (e.direction === 'asc' ? 0 : 1) : null;
    this.pageState.pageIndex = 0;
    this.onPagedAndSorted.emit(this.pageState);

    /** @todo */
    this.testSlideState = false;
  }


  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.pagedData.length;
    return numSelected == numRows;
  }

  /** @Output */
  onDiscrepancySelect(row): void {
    this.selection.toggle(row);
    // this.memberListService.selectMember(this.selection.selected, this.pagedData.length);
  }

  /** @Output */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.pagedData.forEach(row => this.selection.select(row));
    // this.memberListService.selectMember(this.selection.selected, this.pagedData.length);
  }


  isBubbleLighted(element: any,
    option: string): boolean {
    if (!element) {
      return false;
    }

    switch (option) {
      case 'pp':
        return element.payor_pp != element.org_pp;
      case 'sp':
        return element.payor_sp != element.org_sp;
      case 'rc':
        return element.payor_ratecell != element.org_ratecell;
      case 're':
        return element.payor_region != element.org_region;
      case 'pe':
        return element.payor_paid != element.payor_premium - element.payor_pp - element.payor_sp;
      case 'va':
        return element.variance != 0;
      default:
        return false;
    }
  }

  onSearch() {
    clearTimeout(this.searchTimer)
    if (!this.searchForm.valid) {
      return;
    }

    this.searchTimer = setTimeout(() => {
      this.pageState.pageIndex = 0;

      if (this.pageState.sortBy || this.pageState.orderBy) {
        this.sort.sort(<MatSortable>this.defaultSort);
      } else {
        // console.log({ ...this.searchForm.value, ...this.pageState })
        this.onLocalSearch.emit({ ...this.searchForm.value, ...this.pageState });
      }

      this.isLookup = true;

      /** @todo */
      this.testSlideState = false;
    }, 1000);
  }

  // prevent edit field open state switch when click outside on other fields  
  onDiscrepancyItemFieldClicked(element: Discrepancy, field: string): void {
    if (!this.isAuthorized('update')) {
      return;
    }

    if (this.editedField == null && this.editedElement == null) {
      this.editedField = field;
      this.editedElement = element;
      this.editedElementPrev = { ...this.editedElement };
      this.editedElementNext = { ...this.editedElement };
    } else {
      this.onEditDismiss('update')
    }
  }

  onEditDismiss(type?: string) {
    if (this.editedElement && typeof (this.editedElement.dueDate) === 'object') {
      let date: string = moment.utc(this.editedElement.dueDate).format('YYYY-MM-DD');
      this.editedElement.dueDate = date;
    }

    if (this.editedElement && this.editedElement.dueDate === "Invalid date") {
      this.editedElement.dueDate = this.editedElementPrev.dueDate;
    }

    // check if same
    if (!deepIsEqual(this.editedElement, this.editedElementPrev)) {
      // console.log(this.selectObject, this.editedElement.dueDate)
      if (this.selectObject !== null) {

        // Temp solution for user Option mapping
        if ('userID' in this.selectObject) {
          this.selectObject = {
            assigned_UserID: this.selectObject.userID,
            assigned_UserName: this.selectObject.userNameAD
          }
        }

        this.editedElementNext = Object.assign(this.editedElementNext, this.selectObject);
        this.editedElement = Object.assign(this.editedElement, this.selectObject);

      } else {
        // console.log(this.editedElement.dueDate);
        this.editedElementNext = { ...this.editedElement }
      }

      // Test
      this.testSlideState = true;

      this.service.updateDiscrepancy(this.editedElementNext, this.editedElementPrev);
    } else {

      if (type === "update") {
        this.openSnackBar("Nothing Changed", "Dismiss")
      }
    }


    this.editedElement = null;
    this.editedField = null;
    this.selectObject = null;
    this.editedElementNext = null;
    this.editedElementPrev = null;
  }

  onSelect(e) {
    // console.log('ON dropdown SELECT', e)
    this.selectObject = e;
  }

  getOptions(option: string, product?: string): any[] {
    return this.settingService.getOptions(option, product);
  }

  onCommentClick(discrepancy: Discrepancy): void {
    this.showCommentary = true;
    this.selectDiscrepancyID = discrepancy.discrepancyID;
    this.selectMasterPatientID = discrepancy.masterPatientID;
    this.selectDiscrepancy = discrepancy;
    // this.expandedElement = discrepancy;
  }

  onDiscrepancyDetailClick(e: any): void {
    this.service.onDiscrepancyDetailClick(e);
    this.onDiscrepancyDetailClicked.emit(e);
  }

  // MOCK
  randomAccess(items: any[]) {
    return items[Math.floor(Math.random() * items.length)];
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1500,
    });
  }

  getAging(element: Discrepancy): number {
    return Math.floor((new Date().getTime() - Date.parse(element.memberMonth)) / 86400000);
  }

  onCommentaryDismissed() {
    this.showCommentary = false;
    this.selectDiscrepancyID = null;
    this.selectMasterPatientID = null;
    this.selectDiscrepancy = null;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DiscreapcnyUpdateDialogComponent, {
      height: '500px',
      width: '400px',
      data: { selection: this.selection, type: 'discrepancy', formOptions: this.settingService.getDiscrepancyBulkUpdateFormOptions() }
    });

    this.dialogClose$ = dialogRef.afterClosed().subscribe((form) => {
      if (!form || form === null)
        return;

      form.discrepancyIDs = this.selection.selected.map((discrepancy: Discrepancy) => discrepancy.discrepancyID);

      this.service.bulkUpdateDiscrepancyByIds(form);
      // @TEST
      if (form.DiscrepancyStatus && !form.DiscrepancyStatus.discrepancyCategoryDisplay) {
        this.testSlideState = true;
      }

      this.selection.clear();
    });
  }

  isAuthorized(view: string) {
    switch (view) {
      case "explore":
        return this.authService.isViewAuthorized(this.infoPermissions);
      case "update":
        return this.authService.isViewAuthorized(this.updatePermissions);
      case "bulk_update":
        return this.authService.isViewAuthorized(this.bulkUpdatePermissions);
      case "bulk_update_filter":
        return this.authService.isViewAuthorized(this.bulkUpdateFilterPermissions);
      case "comment":
        return this.authService.isViewAuthorized(this.commentPermissions);
      default:
        return false;
    }
  }

  onNotificationClicked() {

    if (!this.notificationService.hasNotification())
      return;

    const notification = this.notificationService.getAndResetNotification();
    console.log('NOTIFICATION OBSERVED', notification);
    switch (notification.NotificationType) {
      case 'comment':
        this.showCommentary = true;
        this.selectDiscrepancyID = notification.NotificationObject['DiscrepancyID'];
        this.selectMasterPatientID = notification.NotificationObject['MasterPatientID'];
        return;
      case 'discrepancy':
        // this.notificationService.onNotificationClick(notification);
        return;
      default:
        return;
    }
  }
}
