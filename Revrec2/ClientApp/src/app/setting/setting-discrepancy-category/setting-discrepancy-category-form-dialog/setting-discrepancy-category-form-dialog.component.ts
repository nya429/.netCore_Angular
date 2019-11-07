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
  formOptions:{ };

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
    discrepancyCategoryID: null,
    discrepancyCategory: '',
    discrepancyCategoryDescription: '',
    discrepancyCategoryDisplay: false,
    activeFlag: false,
  }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SettingDiscrepancyCategoryFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      selection: SelectionModel<any>, 
      data: DiscrepancyCategory,
      type: string | null, 
      formOptions:{}
    }) {
      console.log(this.data)
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
      this.formInitOption.discrepancyCategoryID = this.data.data.discrepancyCategoryID;
      this.formInitOption.discrepancyCategory = this.data.data.discrepancyCategory;
      this.formInitOption.discrepancyCategoryDescription = this.data.data.discrepancyCategoryDescription;
      this.formInitOption.discrepancyCategoryDisplay = this.data.data.discrepancyCategoryDisplay;
      this.formInitOption.activeFlag = this.data.data.activeFlag;
    }
    this.form = new FormGroup({
      discrepancyCategoryID: new FormControl(this.formInitOption.discrepancyCategoryID, {
      }),
      discrepancyCategory: new FormControl(this.formInitOption.discrepancyCategory , {
        validators: [Validators.required]
      }),
      discrepancyCategoryDescription: new FormControl(this.formInitOption.discrepancyCategoryDescription , {
      }),
      discrepancyCategoryDisplay: new FormControl( this.formInitOption.discrepancyCategoryDisplay, {
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
    switch(option)  {
      default:
          return [];
    }
  }

  onSave(): void {
    // console.log(this.form.value, this.isFormsValid() )
    if (this.isFormsValid()) {
      let dscrepancyCategory: DiscrepancyCategory = {
        discrepancyCategoryID: this.form.value.discrepancyCategoryID,
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
