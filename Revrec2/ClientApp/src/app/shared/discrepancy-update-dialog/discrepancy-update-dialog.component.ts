import { Subscription } from 'rxjs';
import { DiscrepancyStatus, DiscrepancyStatusOption } from 'src/app/model/setting.model';
import { Component, OnInit, Inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { UserOption } from 'src/app/model/user.model';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-discrepancy-update-dialog',
  templateUrl: './discrepancy-update-dialog.component.html',
  styleUrls: ['./discrepancy-update-dialog.component.css']
})
export class DiscreapcnyUpdateDialogComponent implements OnInit, OnDestroy {
  @ViewChild('dueDateEl') startDateInputEl: ElementRef;
  form: FormGroup;
  formOptions: {
    userOptions: UserOption[] | null,
    discrepancyStatusOptions: DiscrepancyStatusOption[] | null
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

  private searchForm$: Subscription;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DiscreapcnyUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      selection: SelectionModel<any>,
      type: string | null,
      formOptions: {
        userOptions: UserOption[] | null,
        discrepancyStatusOptions: DiscrepancyStatusOption[] | null
      }
    }) {


  }

  ngOnInit() {
    this.initForm();
    // console.log(this.data.formOptions)

    this.searchForm$ = this.form.valueChanges.subscribe(() => {
      // console.log(this.form)
    }); 
  }

  ngOnDestroy() {
    this.searchForm$.unsubscribe();
  }

  onClose(): void {
    this.dialogRef.close('');
  }

  initForm() {
    this.form = new FormGroup({
      Assigned_User: new FormControl('',
        // {validators: [Validators.required] }
      ),
      DueDate: new FormControl(''),
      DiscrepancyStatus: new FormControl(''),
      DiscrepancyComment: new FormControl(''),
    });
  }

  getOptions(option: string): any[] {
    switch (option) {
      case 'user':
        return this.data.formOptions.userOptions;
      case 'discrepancyStatus':
        return this.data.formOptions.discrepancyStatusOptions;
      default:
        return [];
    }
  }

  onSave(): void {
    if (this.isFormsValid()) {
      let updateForm = this.form.value;
      this.dialogRef.close(updateForm);
    }
  }


  isFormsValid(): boolean {
    return this.form.valid && !this.form.pristine;
  }

  fireWhenEmpty(el, formControlName: string): void {
    // console.log(el.value, this.form.value);
    if (!el.value || el.value === '') {
      this.form.patchValue({ [formControlName]: '' }, { emitEvent: true })
    } 
  }
}


