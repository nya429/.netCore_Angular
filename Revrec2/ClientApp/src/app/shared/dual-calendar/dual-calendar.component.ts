import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';
import { MatCalendar, MatMenuTrigger } from '@angular/material';
const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM',
  },
  display: {
    dateInput: 'YYYY-MM',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-dual-calendar',
  templateUrl: './dual-calendar.component.html',
  styleUrls: ['./dual-calendar.component.css']
})
export class DualCalendarComponent implements OnInit {
  @ViewChild('menuTrigger') calendarMenuTrigger: MatMenuTrigger;
  @Output() dateApplied = new EventEmitter<any>();
  @Input('timeSpanFetched') timeSpanFetched: object;
  @Input('timeSpanApplied') timeSpanApplied: object;

  public valuesApplied: {
    startDate: string | Moment,
    endDate: string | Moment,
  } = {
      startDate: '',
      endDate: ''
    };

  public searchForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.searchForm = this.fb.group({
      startDate: '',
      endDate: '',
    }, {
        validator: this.dateInputValidator
      });

    this.valuesApplied = this.searchForm.value;
  }

  dateInputValidator(form: FormGroup) {
    const conditionStartOverEnd = (
      !!form.get('startDate').value
      && !!form.get('endDate').value
    )
      && form.get('startDate').value.diff(form.get('endDate').value) >= 0;

    const condition = form.get('startDate').getError('matDatepickerParse')
      || form.get('endDate').getError('matDatepickerParse');

    const conditionEmpty = form.get('startDate').value === ''
      || form.get('endDate').value  === '';

    let error = {};
    if (condition)
      error['dateInputError'] = true;
    if (conditionStartOverEnd)
      error['startoverEnd'] = true;
    if (conditionEmpty)
      error['empty'] = true;

    return condition || conditionStartOverEnd || conditionEmpty ? error : null;
  }

  fireWhenEmpty(el, formControlName: string): void {
    if (!el.value || el.value === '') {
      this.searchForm.patchValue({ [formControlName]: '' }, { emitEvent: true })
    }
  }

  chosenYearHandler(normalizedYear: Moment, formControlName: string) {
    var ctrlValue = this.searchForm.value[formControlName];
    if (!ctrlValue)
      ctrlValue = moment();
    ctrlValue.year(normalizedYear.year());

    this.searchForm.get(formControlName).setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, formControlName: string) {
    var ctrlValue = this.searchForm.value[formControlName];
    if (!ctrlValue)
      ctrlValue = moment();
    ctrlValue.month(normalizedMonth.month());

    this.searchForm.get(formControlName).setValue(ctrlValue);

  }

  updateDateFromCalendar(normalizedDate: Moment, formControlName: string, calendar: MatCalendar<Moment>) {
    var ctrlValue = this.searchForm.value[formControlName];
    if (!ctrlValue)
      ctrlValue = moment();

    this.searchForm.get(formControlName).setValue(normalizedDate);
    this.searchForm.get(formControlName).markAsDirty();
    // console.log(this.searchForm)
  }

  onCalendarMenuApply() {
    this.valuesApplied = { ...this.searchForm.value };
    this.dateApplied.emit({
      startDate: this.searchForm.value.startDate ? (this.searchForm.value.startDate as Moment).format("YYYY-MM-DD") : "",
      endDate: this.searchForm.value.endDate ? (this.searchForm.value.endDate as Moment).format("YYYY-MM-DD") : "",
    })
    this.calendarMenuTrigger.closeMenu();


  }

  onCalendarMenuCancel() {
    this.searchForm.patchValue(this.valuesApplied, { emitEvent: false })
    // console.log(this.searchForm.value)
    // console.log(this.valuesApplied);
    this.calendarMenuTrigger.closeMenu();
  }

  getAppliedDate(dateName: string) {
    // console.log(this.timeSpanApplied)
    if (this.timeSpanApplied && this.timeSpanApplied[dateName])
      return this.timeSpanApplied[dateName];

    if (this.timeSpanFetched && this.timeSpanFetched[dateName])
      return this.timeSpanFetched[dateName];

    return this.valuesApplied.startDate ? (this.valuesApplied[dateName] as Moment).format("YYYY-MM-DD") : ""
  }

  isDateReady() {
    return !!this.timeSpanFetched['startDate'] && !!this.timeSpanFetched['endDate'];
  }

}
