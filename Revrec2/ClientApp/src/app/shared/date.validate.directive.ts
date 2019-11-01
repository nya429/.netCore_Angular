import {
  ReactiveFormsModule,
  NG_VALIDATORS,
  FormsModule,
  FormGroup,
  FormControl,
  ValidatorFn,
  Validator,   
  AbstractControl} from "@angular/forms";
import { Directive, ElementRef, HostListener } from "@angular/core";
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';

const moment = _rollupMoment || _moment;

@Directive({
  selector: '[appDateValitor]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: DateValidatorDirective,
    multi: true
  }]
})
export class DateValidatorDirective implements Validator {
  private yyyymmddReg: RegExp = /^(|\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01]))$/;
  validator: ValidatorFn;

  constructor(private el: ElementRef) {
    this.validator = this.dateValidator();
  }

  validate(control: AbstractControl): { [key: string]: any } | null {
    return this.validator(control);
  }

  dateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let isValid = this.yyyymmddReg.test(control.value);
      return !isValid ? { 'invalidDate': true } : null;
    };
  }
}

export function execLenValidator(length: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    let isValid = control.value === null || 
    control.value.toString().length === 0 || 
    control.value.toString().trim().length === length; 
    return !isValid ? { 'invalidLength': true } : null;
  };
}

export function minLenValidator(length: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {

    
    let isValid = control.value === null || 
    control.value.toString().length === 0 || 
    control.value.toString().trim().length >= length; 
    return !isValid ? { 'invalidLength': true } : null;
  };
}



export function dateValidatorFn(el): ValidatorFn {
  const yyyymmddReg: RegExp = /^(\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01]))$/;
   
  return (control: AbstractControl): { [key: string]: any } | null => {
    // console.log(control)
    let isValid = yyyymmddReg.test(control.value ? control.value.format("YYYY-MM-DD"): '');

    return !isValid ? { 'invalidDate': true } : null;
  };
}


export function cCAEmailValidatorFn(el): ValidatorFn {
  const yyyymmddReg: RegExp = /^(\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01]))$/;
   
  return (control: AbstractControl): { [key: string]: any } | null => {
    // console.log(control)
    let isValid = yyyymmddReg.test(control.value ? control.value.format("YYYY-MM-DD"): '');

    return !isValid ? { 'invalidDate': true } : null;
  };
}


@Directive({
  selector: '[appDateInputFormat]'
})
export class DateInputFormatDirective {
  private regex: RegExp = new RegExp(/^([12])\d{3}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/);
  private digitR: RegExp = new RegExp(/^\d|\-$/);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  constructor(private el: ElementRef) {
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // console.log(this.el.nativeElement.value);
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    let next: string = current.concat(event.key);
    // console.log(next, !this.regex.test(String(next)));
    // console.log(next, !String(next).match(this.regex))
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event) {
    // console.log('blur', this.el.nativeElement.value);
    let current: string = this.el.nativeElement.value;
    // console.log(current);
  }
}