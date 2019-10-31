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

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SettingDiscrepancyStatusFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      selection: SelectionModel<any>,
      type: string | null,
      formOptions: {
        discrepancyCategoryOption: DiscrepancyCategoryOption[] | null,
        discrepancyStatusTypeOption: any[] | null
      }

    }) { }

  ngOnInit() {
    this.initForm();
  }

  onClose(): void {
    this.dialogRef.close('');
  }

  initForm() {
    this.formOptions = this.data.formOptions;
    this.form = new FormGroup({
      discrepancyStatus: new FormControl('', {
        validators: [Validators.required]
      }),
      discrepancyStatusDescription: new FormControl('', {}),
      discrepancyCategory: new FormControl('', {
        validators: [Validators.required]
      }),
      activeFlag: new FormControl(false, {
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
        discrepancyStatusId: null,
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

const ss = [
  {
    discrepancyStatusID: 1,
    description: 'new',
    category: 'new',
    active: 1,
    discrepnacyType: 'User Entered'
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
    category: 'pending',
    active: 1,
    isUIDisplayed: 1,
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
    description: 'Write Off',
    category: 'complete',
    active: 1,
    discrepnacyType: 'User Entered'
  }


]