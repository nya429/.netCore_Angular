import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { DiscrepancyCategoryOption, DiscrepancyStatus } from 'src/app/model/setting.model';

@Component({
  selector: 'app-setting-discrepancy-status-form-dialog',
  templateUrl: './setting-discrepancy-status-form-dialog.component.html',
  styleUrls: ['./setting-discrepancy-status-form-dialog.component.css']
})
export class SettingDiscrepancyStatusFormDialogComponent implements OnInit {
  form: FormGroup;
  formOptions: {
    discrepancyCategoryOption: DiscrepancyCategoryOption[] | null,
    discrepancyStatusTypeOption: any[] | null
  };

  stateOptions = {
    create: {
      title: 'Create'
    },
    bulk_update: {
      title: 'Bulk Update'
    },
    update: {
      title: 'Update'
    }
  }

  formInitOption = {
    discrepancyStatusId: null,
    discrepancyStatus: '',
    discrepancyStatusDescription: '',
    discrepancyCategory: { },
    activeFlag: false,
  }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SettingDiscrepancyStatusFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      selection: SelectionModel<any>,
      data: DiscrepancyStatus,
      type: string | null,
      formOptions: {
        discrepancyCategoryOption: DiscrepancyCategoryOption[] | null,
        discrepancyStatusTypeOption: any[] | null
      }
    }) {
  }

  ngOnInit() {
    this.initForm();
  }

  onClose(): void {
    this.dialogRef.close('');
  }

  initForm() {
    this.formOptions = this.data.formOptions;
    if (this.data.type === 'update') {
      this.formInitOption.discrepancyStatusId = this.data.data.discrepancyStatusId;
      this.formInitOption.discrepancyStatus = this.data.data.discrepancyStatus;
      this.formInitOption.discrepancyStatusDescription = this.data.data.discrepancyStatusDescription;
      this.formInitOption.discrepancyCategory = this.formOptions.discrepancyCategoryOption.find(dc => dc.discrepancyCategoryID === this.data.data.discrepancyCategoryID)
      this.formInitOption.activeFlag = this.data.data.activeFlag;
    }

    this.form = new FormGroup({
      discrepancyStatusId: new FormControl(this.formInitOption.discrepancyStatusId, {
      }),
      discrepancyStatus: new FormControl(this.formInitOption.discrepancyStatus, {
        validators: [Validators.required]
      }),
      discrepancyStatusDescription: new FormControl(this.formInitOption.discrepancyStatusDescription, {
        validators: [Validators.maxLength(250)]
      }),
      discrepancyCategory: new FormControl(this.formInitOption.discrepancyCategory, {
        validators: [Validators.required]
      }),
      activeFlag: new FormControl(this.formInitOption.activeFlag, {
        validators: [Validators.required]
      }),
    });
  }

  // getOption(type: string): string[] {
  //   return this.options.map(d => d[type]).filter((data, i, a) => a.indexOf(data) === i);
  // }

  getOption(option: string): any[] {
    switch (option) {
      case 'discrepancyCategory':
        return this.data.formOptions.discrepancyCategoryOption;
      case 'discrepancyStatusType':
        return this.data.formOptions.discrepancyStatusTypeOption;
      default:
        return [];
    }
  }

  onSave(): void {

    if (this.isFormsValid()) {
      let discrepancyStatus: DiscrepancyStatus = {
        discrepancyStatusId: this.form.value.discrepancyStatusId,
        discrepancyStatus: this.form.value.discrepancyStatus,
        discrepancyStatusDescription: this.form.value.discrepancyStatusDescription,
        discrepancyCategoryID: this.form.value.discrepancyCategory.discrepancyCategoryID,
        discrepancyCategory: this.form.value.discrepancyCategory.discrepancyCategory,
        activeFlag: this.form.value.activeFlag,
        discrepancyCategoryDescription: null,
        discrepancyStatusType: 1
      }
      this.dialogRef.close(discrepancyStatus);
    }
  }

  isFormsValid(): boolean {
    return this.form.valid;
  }
}
