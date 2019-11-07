import { EndpointRoleMap, Roles } from './../../model/user.model';
import { AuthService } from './../../auth/auth.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { MatSnackBar, MatDialog, MatDatepickerInputEvent, ErrorStateMatcher } from '@angular/material';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm, FormBuilder } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { animate, style, transition, trigger } from '@angular/animations';
import { deepIsEqual } from './../../util/deepIsEqual';
import { SettingService } from './../setting.service';
import { SettingRatecardFormDialogComponent } from './setting-ratecard-form-dialog/setting-ratecard-form-dialog.component';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { PagedList } from 'src/app/model/response.model';
import { RateCard, CCARegion, CCARateCell } from 'src/app/model/setting.model';
import { buttonEditSlideTrigger } from '../setting.animation';

const moment = _rollupMoment || _moment;

class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.dirty && form.invalid;
  }
}

@Component({
  selector: 'app-setting-ratecard',
  templateUrl: './setting-ratecard.component.html',
  styleUrls: ['./setting-ratecard.component.css'],
  animations: [
    buttonEditSlideTrigger
  ],
})
export class SettingRatecardComponent implements OnInit, OnDestroy {
  @ViewChild('startDateInputEl') startDateInputEl: ElementRef;
  @ViewChild('endDateInputEl') endDateInputEl: ElementRef;
  private rateCardChanged$: Subscription;
  private rateCardCreation$: Subscription;
  private rateCardUpdate$: Subscription;
  private searchForm$: Subscription;
  private dialogClose$: Subscription;

  private regex: RegExp = new RegExp(/^([12])\d{3}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/);

  // RateCards Data Source
  pagedSource: PagedList<RateCard>;

  // Display State: List: {Empty, NonEmpty}, Add(Stepper), Edit, 

  /** search filter */
  searchForm: FormGroup;
  searchTimer;
  errorMatcher = new CrossFieldErrorMatcher();
  /** Selection */
  selection = new SelectionModel<RateCard>(true, []);

  /** Temp placeholder for FormOptions */
  // formOption = FORM_OPTIONS_MOCK;

  formOptions: {
    CCARateCellOptions: CCARateCell[] | null,
    CCARegionOptions: CCARegion[] | null,
    productOptions: any[] | null
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
    this.createPermissions = this.authService.getRoleMappingSettingByNames('ratecard', 'CreateRateCardAsync');
    this.updatePermissions = this.authService.getRoleMappingSettingByNames('ratecard', 'UpdateRateCardAync');
  }

  ngOnInit() {
    this.initForm();
    this.initState();
    this.initSource();
  }

  ngOnDestroy() {
    this.rateCardChanged$.unsubscribe();
    this.rateCardCreation$.unsubscribe();
    this.rateCardUpdate$.unsubscribe();
    this.searchForm$.unsubscribe();
    if (this.dialogClose$) {
      this.dialogClose$.unsubscribe();
    }
  }

  initState() {
    this.service.rateCardOptionReady$.subscribe(() => {
      this.formOptions = this.service.getRateCardFormOptions();
    })

    this.rateCardChanged$ = this.service.rateCardListChanged.subscribe(result => {
      this.pagedSource = result;
    });


    this.searchForm$ = this.searchForm.valueChanges.subscribe(() => {
      this.getRateCards();
    })

    this.rateCardCreation$ = this.service.rateCardCreated.subscribe((ratecard: RateCard) => {
      let rawPagedSource = { ...this.pagedSource };
      rawPagedSource.count += 1
      rawPagedSource.list.unshift(ratecard);
      rawPagedSource.list.pop();
      this.pagedSource = rawPagedSource;
      this.pagedSource.count += 1;
      this.openSnackBar("Rate Card Created", "Dismiss")
    })

    this.rateCardUpdate$ = this.service.rateCardUpdated.subscribe((ratecardUpdated: RateCard) => {

      let rawPagedSource = { ...this.pagedSource };
      rawPagedSource.list = rawPagedSource.list.map((ratecard: RateCard) => {
        if (ratecard.rateCardId === ratecardUpdated.rateCardId) {
          if (!deepIsEqual(ratecard, ratecardUpdated)) {
            ratecard = { ...ratecardUpdated };
          }
        }
        return ratecard;
      });
      this.pagedSource = rawPagedSource;
      this.openSnackBar("Update Successed", "Dismiss")
    });
  }

  initSource() {
    this.pagedSource = this.service.getpagedListInl();
    this.formOptions = this.service.getRateCardFormOptions();
    this.service.getRateCards({}, this.searchForm.value);
  }

  getRateCards() {
    clearTimeout(this.searchTimer)
    // prevent search fired when time input invalid, e.g. 2013-01-0
    if (!this.isTimeInputValidToFire()) {
      return;
    }
    this.searchTimer = setTimeout(() => {
      this.service.getRateCards({}, this.searchForm.value);
    }, 800);
  }


  initForm() {
    this.searchForm = this.fb.group({
      ccaRateCell: '',
      ccaRegion: '',
      startDate: '',
      endDate: '',
    }, {
        validator: this.dateInputValidator
      });
  }

  // getOptionMOCK(form: string): string[] {
  //   if (form === 'rateCell') {
  //     return this.formOption.rateCell['ICO'].concat(this.formOption.rateCell['SCO']);
  //   } else if (form === 'region') {
  //     return this.formOption.region['ICO'].concat(this.formOption.region['SCO']);
  //   } else {
  //     return [];
  //   }
  // }

  getOptions(option: string): CCARateCell[] | CCARegion[] | String[] | null {
    switch (option) {
      case 'rateCell':
        return this.formOptions.CCARateCellOptions;
      case 'region':
        return this.formOptions.CCARegionOptions;
      default:
        return null;
    }
  }

  onRateCardSelected(e: SelectionModel<RateCard>) {
    this.selection = e;
  }

  onListPagedSorted(e) {
    this.service.getRateCards(e, this.searchForm.value)
  }

  onDateInput(e: MatDatepickerInputEvent<Date>): void {
  }

  isTimeInputValidToFire() {
    let startValid = this.regex.test(this.startDateInputEl.nativeElement.value)
      || !this.startDateInputEl.nativeElement.value.length
    let endValid = this.regex.test(this.endDateInputEl.nativeElement.value)
      || !this.endDateInputEl.nativeElement.value.length;
    let timeValid = startValid && endValid;
    return timeValid;
  }

  fireWhenEmpty(el, formControlName: string): void {
    if (!el.value || el.value === '') {
      this.searchForm.patchValue({ [formControlName]: '' }, { emitEvent: true })
    }
  }

  dateInputValidator(form: FormGroup) {
    const condition = form.get('startDate').getError('matDatepickerParse') || form.get('endDate').getError('matDatepickerParse')
    return condition ? { dateInputError: true } : null;
  }

  onEditted(e: RateCard) {
    this.openDialog("update", e);
  }

  onUpdate(e) {
    this.service.updateRateCard(e[0]);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
    });
  }


  openDialog(action: string, element?: RateCard): void {
    const dialogRef = this.dialog.open(SettingRatecardFormDialogComponent, {
      height: '500px',
      width: '800px',
      data: { selection: null, type: action, data: element, formOptions: this.service.getRateCardFormOptions() }
    });

    this.dialogClose$ = dialogRef.afterClosed().subscribe((result: RateCard) => {
      if (!result)
        return;

      switch (action) {
        case "create":
          this.service.createRateCard(result);
          return;
        case "update":
          this.service.updateRateCard(result);
          return;
        default:
          return;
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
