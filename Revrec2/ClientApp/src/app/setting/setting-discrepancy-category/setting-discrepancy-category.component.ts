import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingService } from '../setting.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog, MatSnackBar } from '@angular/material';
import { deepIsEqual } from './../../util/deepIsEqual';
import { SettingDiscrepancyCategoryFormDialogComponent } from './setting-discrepancy-category-form-dialog/setting-discrepancy-category-form-dialog.component';
import { DiscrepancyCategory } from 'src/app/model/setting.model';
import { PagedList } from 'src/app/model/response.model';
import { buttonEditSlideTrigger } from '../setting.animation';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-setting-discrepancy-category',
  templateUrl: './setting-discrepancy-category.component.html',
  styleUrls: ['./setting-discrepancy-category.component.css'],
  animations: [
    buttonEditSlideTrigger
  ],
})
export class SettingDiscrepancyCategoryComponent implements OnInit {


  private discrepancyCategoryChanged$: Subscription;
  private discrepancyCategoryCreation$: Subscription;
  private discrepancyCategoryUpdate$: Subscription;
  private searchForm$: Subscription;
  private dialogClose$: Subscription;

  // Display State: List: {Empty, NonEmpty}, Add(Stepper), Edit, 

  // DiscrepancyStatus Data Source
  pagedSource: PagedList<DiscrepancyCategory>;

  /** search filter */
  searchForm: FormGroup;
  searchTimer;

  selection = new SelectionModel<DiscrepancyCategory>(true, []);

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
    this.createPermissions = this.authService.getRoleMappingSettingByNames('discrepancyCateogry', 'CreateDiscreapancyCategoryAsync');
    this.updatePermissions = this.authService.getRoleMappingSettingByNames('discrepancyCateogry', 'UpdateDiscrepancyCategoryByIDAsync');
   }

  ngOnInit() {
    this.initForm();
    this.initState();
  }

  ngOnDestroy() {
    this.discrepancyCategoryChanged$.unsubscribe();
    this.discrepancyCategoryCreation$.unsubscribe();
    this.discrepancyCategoryUpdate$.unsubscribe();
    this.searchForm$.unsubscribe();
    if (this.dialogClose$) {
      this.dialogClose$.unsubscribe();
    }
  }


  initState() {
    this.pagedSource = this.service.getpagedListInl();
    this.discrepancyCategoryChanged$ = this.service.discrepancyCategoryListChanged.subscribe(result => {
      this.pagedSource = result;
    });
    this.service.getDiscrepancyCategories({})

    this.searchForm$ = this.searchForm.valueChanges.subscribe(() => {
      this.getDiscrepancyCategories();
    });

    this.discrepancyCategoryUpdate$ = this.service.discrepancyCategoryUpdated.subscribe((discrepancyStatusUpdated: DiscrepancyCategory) => {
      let rawPagedSource = { ...this.pagedSource };
      rawPagedSource.list = rawPagedSource.list.map((discrepancyCategory: DiscrepancyCategory) => {
        if (discrepancyCategory.discrepancyCategoryID === discrepancyStatusUpdated.discrepancyCategoryID) {
          if (!deepIsEqual(discrepancyCategory, discrepancyStatusUpdated)) {
            discrepancyCategory = { ...discrepancyStatusUpdated };
          }
        }
        return discrepancyCategory;
      });
      this.pagedSource = rawPagedSource;
      this.openSnackBar("Update Successed", "Dismiss")
    });


    this.discrepancyCategoryCreation$ = this.service.discrepancyCategoryCreated.subscribe((discrepancyCategory: DiscrepancyCategory) => {
      let rawPagedSource = { ...this.pagedSource };
      rawPagedSource.count += 1
      rawPagedSource.list.unshift(discrepancyCategory);
      rawPagedSource.list.pop();
      this.pagedSource = rawPagedSource;
      this.pagedSource.count += 1;
      this.openSnackBar("Discrepancy Status Created", "Dismiss")
    });
  }

  getDiscrepancyCategories() {
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => {
      this.service.getDiscrepancyCategories();
    }, 800);
  }

  initForm() {
    this.searchForm = this.fb.group({
      // discrepancyStatus: '',
      // discrepancyCategoryID: '',
      // discrepancyStatusType: ''
    });
  }

  onDiscrepnacyCategorySelected(e: SelectionModel<DiscrepancyCategory>) {
    this.selection = e;
  }

  onListPagedSorted(e) {
    this.service.getDiscrepancyCategories(e);
  }

  onUpdate(e) {
    this.service.updateDiscrepancyCategory(e[0]);
  }

  onEditted(e: DiscrepancyCategory) {
    this.openDialog("update", e);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
    });
  }

  openDialog(action: string, element?: DiscrepancyCategory): void {
    const dialogRef = this.dialog.open(SettingDiscrepancyCategoryFormDialogComponent, {
      height: '400px',
      width: '400px',
      data: { selection: this.selection, data: element, type: action, formOptions: {} }
    });

    this.dialogClose$ = dialogRef.afterClosed().subscribe((result: DiscrepancyCategory) => {
      if (!result)
        return;

      switch (action) {
        case "create":
          this.service.createDiscrepancyCategory(result);
          return;
        case "update":
          this.service.updateDiscrepancyCategory(result);
          return;
        default:
          return ;
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
