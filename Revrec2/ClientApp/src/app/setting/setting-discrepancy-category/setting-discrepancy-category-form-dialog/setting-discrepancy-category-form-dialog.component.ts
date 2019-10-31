import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { DiscrepancyCategory } from 'src/app/model/setting.model';

@Component({
  selector: 'app-setting-discrepancy-category-form-dialog',
  templateUrl: './setting-discrepancy-category-form-dialog.component.html',
  styleUrls: ['./setting-discrepancy-category-form-dialog.component.css']
})
export class SettingDiscrepancyCategoryFormDialogComponent implements OnInit {
  form: FormGroup;
  formOptions:{
  
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
    public dialogRef: MatDialogRef<SettingDiscrepancyCategoryFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      selection: SelectionModel<any>, 
      type: string | null, 
      formOptions:{}
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
      discrepancyCategory: new FormControl('', {
        validators: [Validators.required]
      }),
      discrepancyCategoryDescription: new FormControl('', {
      }),
      discrepancyCategoryDisplay: new FormControl(false, {
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
    switch(option)  {
      default:
          return [];
    }
  }

  onSave(): void {
    // console.log(this.form.value, this.isFormsValid() )
    if (this.isFormsValid()) {
      let dscrepancyCategory: DiscrepancyCategory = {
        discrepancyCategoryID: null,
        discrepancyCategory: this.form.value.discrepancyCategory,
        discrepancyCategoryDescription: this.form.value.discrepancyCategoryDescription,
        discrepancyCategoryDisplay: this.form.value.discrepancyCategoryDisplay,
        activeFlag: this.form.value.activeFlag,
      }
      this.dialogRef.close(dscrepancyCategory);
    }
  }

  isFormsValid(): boolean {
    return this.form.valid;
  }
}
