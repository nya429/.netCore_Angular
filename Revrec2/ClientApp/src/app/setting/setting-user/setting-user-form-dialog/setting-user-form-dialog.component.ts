import { User } from 'src/app/model/user.model';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, ErrorStateMatcher } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';


/** Error when the parent is invalid */
class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.dirty && form.getError('ccaemailValidator');
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
  errorMatcher = new CrossFieldErrorMatcher();

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
        validators: [Validators.required, Validators.pattern('[a-zA-Z]+@commonwealthcare.org')]
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
        validator: [this.roleValidator, this.ccaemilValidator]
      });
  }

  roleValidator(form: FormGroup) {
    const condition = form.get('administrator').value
      || form.get('helpdesk').value
      || form.get('specialist').value
      || form.get('supervisor').value
    return condition ? null : { roleValidator: true };
  }

  ccaemilValidator(form: FormGroup) {
    let firstName = form.get('FirstName').value as string;
    let firstName2 = firstName.toLowerCase().replace(/[^a-zA-Z ]/g, "");
    // firstName = firstName.substring(0,1).toLowerCase().replace(/[^a-zA-Z ]/g, "");

    let lastName = form.get('LastName').value as string;
    lastName = lastName.toLowerCase().replace(/[^a-zA-Z ]/g, "");

    // let condition = form.get('Email').value === firstName + lastName + "@commonwealthcare.org"

    let firstNameAltCharList = "(";
    let i = 1;
    while (i <= firstName2.length) {
      if (i != firstName2.length) {
        firstNameAltCharList = firstNameAltCharList + firstName2.substring(1, i) + "|"
      } else {
        firstNameAltCharList = firstNameAltCharList + firstName2.substring(1, i) + ")"
      }
      i++;
    }

    if(!firstName2 || !lastName) {
      firstNameAltCharList = "()";
      lastName = "";
      firstName2 = "";
    }
    // console.log(`${firstName2[0]}${firstNameAltCharList}${lastName}@commonwealthcare.org`)
    const reg = RegExp(`${firstName2[0]}${firstNameAltCharList}${lastName}@commonwealthcare.org`, 'i');

    let condition2 = reg.test(form.get('Email').value)

    // console.log(firstName + lastName + "@commonwealthcare.org", condition)s
    // console.log(`${firstName2[0]}${firstNameAltCharList}${lastName}@commonwealthcare.org`, condition2)

    return condition2 ? null : { ccaemailValidator: true };
  }

  isFormsValid(): boolean {
    return this.form.valid;
  }

  getOption(option: string): any[] {
    switch (option) {
      default:
        return [];
    }
  }

  onSave(): void {
    // console.log(this.form.value, this.isFormsValid() )
    if (this.isFormsValid()) {
      let user: User = {
        userID: null,
        userFirstName: this.form.value.FirstName,
        userLastName: this.form.value.LastName,
        userNameAD: this.parseNameAD(),
        userEmail: this.form.value.Email,
        administrator: this.form.value.administrator,
        specialist: this.form.value.specialist,
        supervisor: this.form.value.supervisor,
        helpdesk: this.form.value.helpdesk,
        activeFlag: true,
      }
      this.dialogRef.close(user);
    }
  }

  onClose(): void {
    this.dialogRef.close('');
  }

  parseNameAD(): string {
    return this.form.value.Email.replace(/@commonwealthcare.org/g, "");
  }
}
