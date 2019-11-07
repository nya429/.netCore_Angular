import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { SettingDiscrepancyStatusFormDialogComponent } from './setting-discrepancy-status-form-dialog/setting-discrepancy-status-form-dialog.component';
import { SettingService } from '../setting.service';
import { Subscription } from 'rxjs';
import { deepIsEqual } from './../../util/deepIsEqual';
import { DiscrepancyStatus, DiscrepancyCategoryOption, DiscrepancyStatusOption } from 'src/app/model/setting.model';
import { PagedList } from 'src/app/model/response.model';
import { buttonEditSlideTrigger } from '../setting.animation';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-setting-discrepancy-status',
  templateUrl: './setting-discrepancy-status.component.html',
  styleUrls: ['./setting-discrepancy-status.component.css'],
  animations: [
    buttonEditSlideTrigger
  ],
})
export class SettingDiscrepancyStatusComponent implements OnInit, OnDestroy {
  dataSource: DiscrepancyStatusMock[] = DISCREPANCYS_STATUSES;

  private discrepancyStatusChanged$: Subscription;
  private discrepancyStatusCreation$: Subscription;
  private discrepancyStatusUpdate$: Subscription;
  private searchForm$: Subscription;
  private dialogClose$: Subscription;

  // Display State: List: {Empty, NonEmpty}, Add(Stepper), Edit, 

  // DiscrepancyStatus Data Source
  pagedSource: PagedList<DiscrepancyStatus>;

  /** search filter */
  searchForm: FormGroup;
  searchTimer;

  selection = new SelectionModel<DiscrepancyStatus>(true, []);

  formOptions: {
    discrepancyStatus: string,
    discrepancyCategoryID: number,
    discrepancyStatusType: number
  };

  /** Authorization */
  createPermissions: string;
  updatePermissions: string;

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private service: SettingService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.createPermissions = this.authService.getRoleMappingSettingByNames('discrepancyStatues', 'CreateDiscrepancyStatusAsync');
    this.updatePermissions = this.authService.getRoleMappingSettingByNames('discrepancyStatues', 'UpdateDiscrepancyStatusByIDAsync');
  }

  ngOnInit() {
    this.initForm();
    this.initState();
  }

  ngOnDestroy() {
    this.discrepancyStatusChanged$.unsubscribe();
    this.discrepancyStatusCreation$.unsubscribe();
    this.discrepancyStatusUpdate$.unsubscribe();
    this.searchForm$.unsubscribe();
    if (this.dialogClose$) {
      this.dialogClose$.unsubscribe();
    }
  }


  initState() {
    this.pagedSource = this.service.getpagedListInl();
    this.discrepancyStatusChanged$ = this.service.discrepancyStatusListChanged.subscribe(result => {
      this.pagedSource = result;
    });
    this.service.getDiscrepancyStatuses({}, this.searchForm.value)

    this.searchForm$ = this.searchForm.valueChanges.subscribe(() => {
      this.getDiscrepancyStatuses();
    })

    this.discrepancyStatusUpdate$ = this.service.discrepancyStatusUpdated.subscribe((discrepancyStatusUpdated: DiscrepancyStatus) => {
      let rawPagedSource = { ...this.pagedSource };
      rawPagedSource.list = rawPagedSource.list.map((discrepancyStatus: DiscrepancyStatus) => {
        if (discrepancyStatus.discrepancyStatusId === discrepancyStatusUpdated.discrepancyStatusId) {
          if (!deepIsEqual(discrepancyStatus, discrepancyStatusUpdated)) {
            discrepancyStatus = { ...discrepancyStatusUpdated };
          }
        }
        return discrepancyStatus;
      });
      this.pagedSource = rawPagedSource;
      this.openSnackBar("Update Successed", "Dismiss")
    });


    this.discrepancyStatusCreation$ = this.service.discrepancyStatusCreated.subscribe((discrepancyStatus: DiscrepancyStatus) => {
      let rawPagedSource = { ...this.pagedSource };
      rawPagedSource.count += 1
      rawPagedSource.list.unshift(discrepancyStatus);
      rawPagedSource.list.pop();
      this.pagedSource = rawPagedSource;
      this.pagedSource.count += 1;
      this.openSnackBar("Discrepancy Status Created", "Dismiss")
    });
  }

  getDiscrepancyStatuses() {
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => {
      this.service.getDiscrepancyStatuses({}, this.searchForm.value);
    }, 800);
  }

  initForm() {
    this.searchForm = this.fb.group({
      discrepancyStatus: '',
      discrepancyCategoryID: '',
      discrepancyStatusType: ''
    });
  }

  getOptionMOCK(type: string): string[] {
    return this.dataSource.map(d => d[type]).filter((data, i, a) => a.indexOf(data) === i);
  }

  getOption(type: string): DiscrepancyCategoryOption[] | DiscrepancyStatusOption[] {
    return this.service.getOptions(type);
  }

  onDiscrepnacyStatusSelected(e: SelectionModel<DiscrepancyStatus>) {
    this.selection = e;
  }

  onListPagedSorted(e) {
    this.service.getDiscrepancyStatuses(e, this.searchForm.value);
  }


  onUpdate(e) {
    this.service.updateDiscrepancyStatus(e[0]);
  }

  onEditted(e: DiscrepancyStatus) {
    this.openDialog("update", e);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
    });
  }

  openDialog(action: string, element?: DiscrepancyStatus): void {

    const dialogRef = this.dialog.open(SettingDiscrepancyStatusFormDialogComponent, {
      height: '470px',
      width: '400px',
      data: { selection: this.selection, data: element, type: action, formOptions: this.service.getDiscrepancyStatusFormOptions() }
    });

    dialogRef.afterClosed().subscribe((result: DiscrepancyStatus) => {
      if (!result)
        return;

      switch (action) {
        case "create":
          this.service.createDiscrepancyStatus(result);
          return;
        case "update":
          this.service.updateDiscrepancyStatus(result);
          return;
        default:
          return;
      }
    });
  }

  isAuthorized(view: string) {
    switch (view) {
      case "create":
        return this.authService.isViewAuthorized(this.createPermissions);
      case "update":
        return this.authService.isViewAuthorized(this.updatePermissions);
      default:
        return false;
    }
  }
}


export interface DiscrepancyStatusMock {
  discrepancyStatusID: number;
  description: string;
  category: string;
  active: number;
  discrepnacyType: string;
}


export const DISCREPANCYS_STATUSES: DiscrepancyStatusMock[] = [
  {
    discrepancyStatusID: 1,
    description: 'new',
    category: 'new',
    active: 0,
    discrepnacyType: 'System Entered'
  },
  {
    discrepancyStatusID: 2,
    description: 'Resolution expected from change to MP',
    category: 'pending',
    active: 1,
    discrepnacyType: 'User Entered'
  },
  {
    discrepancyStatusID: 3,
    description: 'Appeal denied by Medicaid',
    category: 'pending',
    active: 1,
    discrepnacyType: 'User Entered'
  },
  {
    discrepancyStatusID: 4,
    description: 'Ready for write-off by CCA',
    category: 'pending',
    active: 1,
    discrepnacyType: 'User Entered'
  },
  {
    discrepancyStatusID: 5,
    description: 'Resolution expected via Medicaid 820, Quarterly',
    category: 'pending',
    active: 1,
    discrepnacyType: 'User Entered'
  },
  {
    discrepancyStatusID: 6,
    description: 'At Medicaid for eligibility reinstatement',
    category: 'pending',
    active: 1,
    discrepnacyType: 'User Entered'
  },
  {
    discrepancyStatusID: 7,
    description: 'Contacting Member (Demographics Verification)',
    category: 'Working',
    active: 1,
    discrepnacyType: 'User Entered'
  },
  {
    discrepancyStatusID: 8,
    description: 'At Medicaid For Appeal',
    category: 'pending',
    active: 1,
    discrepnacyType: 'User Entered'
  },
  {
    discrepancyStatusID: 9,
    description: 'Clinical Ops- Expired MDS',
    category: 'pending',
    active: 1,
    discrepnacyType: 'User Entered'
  },
  {
    discrepancyStatusID: 10,
    description: 'Decision to Not Pursue',
    category: 'complete',
    active: 1,
    discrepnacyType: 'User Entered'
  },
  {
    discrepancyStatusID: 11,
    description: 'Write Off',
    category: 'complete',
    active: 1,
    discrepnacyType: 'User Entered'
  },
  {
    discrepancyStatusID: 12,
    description: 'Resolved Off',
    category: 'Resolved',
    active: 0,
    discrepnacyType: 'System Entered'
  }


]


