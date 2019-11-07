import { Subscription } from 'rxjs';
import { Component, OnInit, Inject, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatStepper } from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Directive, ElementRef, HostListener } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { CCARateCell, CCARegion, RateCard } from 'src/app/model/setting.model';
import { deepIsEqual } from './../../../util/deepIsEqual';

export const FORM_OPTIONS_MOCK = {
  product: ['ICO', 'SCO'],
  rateCell: {
    ICO: ['DC2B', 'DC3A', 'DC3B', 'DC2B', 'DC2A', 'DF1'],
    SCO: ['TND', 'CAD', 'CND', 'CWD', 'CWM', 'CNM', 'CAM', 'TNM']
  },
  region: {
    ICO: ['East', 'West', 'Cape', 'State'],
    SCO: ['Bos', 'Non', 'State']
  }
}

@Directive({
  selector: '[appTwoDigitDecimaNumber]'
})
export class TwoDigitDecimaNumberDirective {
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
  private regex2: RegExp = new RegExp(/^\d*\.\d{0,2}$/g);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  constructor(private el: ElementRef) {
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // console.log(this.el.nativeElement.value, this.specialKeys.indexOf(event.key) !== -1);
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    let next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event) {
    // console.log('blur', this.el.nativeElement.value);
    let current: string = this.el.nativeElement.value;
    if (current && !String(current).match(this.regex2)) {
      this.el.nativeElement.value = Number(current).toFixed(2);
    } else if (!current) {
      this.el.nativeElement.value = Number(0).toFixed(2);
    }
  }
}


@Component({
  selector: 'app-setting-ratecard-form-dialog',
  templateUrl: './setting-ratecard-form-dialog.component.html',
  styleUrls: ['./setting-ratecard-form-dialog.component.css']
})
export class SettingRatecardFormDialogComponent implements OnInit, OnDestroy {

  private firstForm$: Subscription;

  selectedIndex: number;
  firstForm: FormGroup;
  secondForm: FormGroup;
  thirdForm: FormGroup;

  // formOptionMock;
  formOptions: {
    CCARateCellOptions: CCARateCell[] | null,
    CCARegionOptions: CCARegion[] | null,
    productOptions: any[] | null
  };

  product: string;

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
    rateCardId: null,
    product: null,
    ccaRateCell: null,
    ccaRegion: null,
    amount: 0,
    startDate: null,
    endDate: null,
    eligibility: null,
    activeFlag: true,
    rateCardLabel: null
  }

  constructor(
    public dialogRef: MatDialogRef<SettingRatecardFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      selection: SelectionModel<any>,
      data: RateCard,
      type: string | null,
      formOptions: {
        CCARateCellOptions: CCARateCell[] | null,
        CCARegionOptions: CCARegion[] | null,
        productOptions: any[] | null
      }
    }) { }

  ngOnInit() {
    // console.log(this.data)
    // this.formOptionMock = FORM_OPTIONS_MOCK;
    this.initForm();
    this.firstForm$ = this.firstForm.valueChanges.subscribe(() => {
      this.secondForm.reset();
      this.thirdForm.reset();
    })

    if (this.data.type === 'create') {
      this.selectedIndex = 0;
    } else {
      this.selectedIndex = 2;
    }

    // console.log(this.getOptions('product'))
  }

  ngOnDestroy() {
    this.firstForm$.unsubscribe();
  }

  initForm() {
    this.formOptions = this.data.formOptions
    // console.log('initForm',this.data.formOptions, this.formOptions )

    if (this.data.type === 'update') {
      this.formInitOption.rateCardId = this.data.data.rateCardId;
      this.formInitOption.product = this.data.data.product;
      this.formInitOption.ccaRateCell = this.formOptions.CCARateCellOptions.find(rc => rc.ccaRateCellID === this.data.data.ccaRateCellId)
      this.formInitOption.ccaRegion = this.formOptions.CCARegionOptions.find(rc => rc.ccaRegionID === this.data.data.ccaRegionId)
      this.formInitOption.amount = this.data.data.amount;
      this.formInitOption.startDate = this.data.data.startDate;
      this.formInitOption.endDate = this.data.data.endDate;
      this.formInitOption.eligibility = this.data.data.eligibility;
      this.formInitOption.activeFlag = this.data.data.activeFlag;
      this.formInitOption.rateCardLabel = this.data.data.rateCardLabel
      console.log(this.data)
      console.log(this.formInitOption)
    }

    this.firstForm = new FormGroup({
      product: new FormControl(this.formInitOption.product, {
        validators: [Validators.required]
      })
    });

    this.secondForm = new FormGroup({
      rateCell: new FormControl(this.formInitOption.ccaRateCell, {
        validators: [Validators.required]
      }),
      region: new FormControl(this.formInitOption.ccaRegion, {
        validators: [Validators.required]
      }),

    });

    this.thirdForm = new FormGroup({
      rate: new FormControl(this.formInitOption.amount, {
        validators: [Validators.required]
      }),
      endDate: new FormControl(this.formInitOption.endDate, {
        validators: [Validators.required]
      }),
      startDate: new FormControl(this.formInitOption.startDate, {
        validators: [Validators.required]
      })
    });
  }

  getOptions(option: string): CCARateCell[] | CCARegion[] | String[] | null {
    let product = this.firstForm.value.product;
    switch (option) {
      case 'rateCell':
        return product ? this.formOptions.CCARateCellOptions.filter(rc => rc.product == product) : this.formOptions.CCARateCellOptions;
      case 'region':
        return product ? this.formOptions.CCARegionOptions.filter(rc => rc.product == product) : this.formOptions.CCARegionOptions;
      case 'product':
        return this.formOptions.productOptions;
      default:
        return null
    }
  }

  getOptionName() {

  }

  onClose(): void {
    this.dialogRef.close('');
  }

  onSave(): void {
    // console.log(this.secondForm.value, this.thirdForm.value)
    if (this.isFormsValid()) {
      let ratecard: RateCard = {
        rateCardId: this.formInitOption.rateCardId,
        product: this.firstForm.value.product,
        ccaRateCell: this.secondForm.value.rateCell.ccaRateCell,
        ccaRateCellId: this.secondForm.value.rateCell.ccaRateCellID,
        ccaRegion: this.secondForm.value.region.ccaRegion,
        ccaRegionId: this.secondForm.value.region.ccaRegionID,
        amount: this.thirdForm.value.rate,
        startDate: this.thirdForm.value.startDate,
        endDate: this.thirdForm.value.endDate,
        eligibility:  this.formInitOption.eligibility,
        activeFlag:  this.formInitOption.activeFlag,
        rateCardLabel: this.formInitOption.rateCardLabel,
      }
      console.log(ratecard, this.data.data, ratecard === this.data.data)
       this.dialogRef.close(ratecard);
    }
  }

  isFormsValid(): boolean {
    return this.firstForm.valid && this.secondForm.valid && this.thirdForm.valid && this.thirdForm.dirty;
  }
}
