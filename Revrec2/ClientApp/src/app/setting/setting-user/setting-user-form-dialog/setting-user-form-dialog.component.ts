import { User } from 'src/app/model/user.model';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, ErrorStateMatcher } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';



class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.dirty && form.invalid;
  }
}
@Component({
  selector: 'app-setting-user-form-dialog',
  templateUrl: './setting-user-form-dialog.component.html',
  styleUrls: ['./setting-user-form-dialog.component.css']
})
export class SettingUserFormDialogComponent implements OnInit {
  form: FormGroup;
  formOptions: {

  };

  stateOptions = {
    create: {
      title: 'Create'
    },
    update: {
      title: 'Update'
    }
  }
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SettingUserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      selection: SelectionModel<any>,
      type: string | null,
      formOptions: {}
    }) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.formOptions = this.data.formOptions;
    this.form = this.fb.group({
      FirstName: new FormControl('', {
        validators: [Validators.required]
      }),
      LastName: new FormControl('', {
        validators: [Validators.required]
      }),
      Email: new FormControl('', {
        validators: [Validators.required, Validators.email]
      }),
      administrator: new FormControl(false, {

      }),
      helpdesk: new FormControl(false, {

      }),
      specialist: new FormControl(false, {

      }),
      supervisor: new FormControl(false, {

      }),
    },
      {
        validator: this.roleValidator
      });
  }

  roleValidator(form: FormGroup) {
    const condition = form.get('administrator').value
      || form.get('helpdesk').value
      || form.get('specialist').value
      || form.get('supervisor').value
    return condition ? null : { roleValidator: true };
  }

  isFormsValid(): boolean {
    return this.form.valid;
  }

  getOption(option: string): any[] {
    switch(option)  {
      default:
          return [];
    }
  }

  onSave(): void {
    // console.log(this.form.value, this.isFormsValid() )
    if (this.isFormsValid()) {
      let user: User = {
        userID: null,
        userFirstName: this.form.value.userFirstName,
        userLastName: this.form.value.userLastName,
        userNameAD: this.form.value.discrepancyCategoryDisplay,
        userEmail: this.form.value.userEmail,
        administrator: this.form.value.administrator,
        specialist: this.form.value.specialist,
        supervisor: this.form.value.supervisor,
        helpdesk: this.form.value.helpdesk,
        activeFlag: true,
      }
      this.dialogRef.close(user);
    }
  }

}
