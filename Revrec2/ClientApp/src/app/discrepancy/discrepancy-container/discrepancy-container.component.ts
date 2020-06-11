import { NavigationService } from './../../navigation/navigation.service';
import { stringify } from '@angular/compiler/src/util';
import { SharedService } from './../../shared/shared.service';
import { Discrepancy } from './../../model/discrepancy.model';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

// import { DisElement, ELEMENT_DATA, D_DATA } from 'src/app/MOCK_DATA';
import { PagedList } from 'src/app/model/response.model';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog, MatSnackBar, MatSnackBarRef } from '@angular/material';
import { SettingService } from 'src/app/setting/setting.service';
import { Subscription, Observable, Subject } from 'rxjs';
import { CCARateCell, CCARegion, DiscrepancyStatusOption } from 'src/app/model/setting.model';
import { controlNameBinding } from '@angular/forms/src/directives/reactive_directives/form_control_name';
import { ReportService } from 'src/app/report/report.service';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';
const moment = _rollupMoment || _moment;

type SubForm = {
  CCAID: number,
  MMIS_ID: string,
  Name: number,
  includeResolved: boolean,
  hasComment: boolean
};
@Component({
  selector: 'app-discrepancy-container',
  templateUrl: './discrepancy-container.component.html',
  styleUrls: ['./discrepancy-container.component.css']
})
export class DiscrepancyContainerComponent implements OnInit, OnDestroy {
  @ViewChild('reconList') reconView: ElementRef;
  @ViewChild('filtersContainer') filtersView: ElementRef;

  @ViewChild('startDateInputEl') startDateInputEl: ElementRef;
  @ViewChild('endDateInputEl') endDateInputEl: ElementRef;
  @ViewChild('startDateInputEl1') startDateInputEl1: ElementRef;
  @ViewChild('endDateInputEl2') endDateInputEl2: ElementRef;

  private discrepancyListChanged$: Subscription;
  private discrepancyUpdated$: Subscription;
  private discrepancyListUpdated$: Subscription;
  private searchForm$: Subscription;
  // discrepancyList: DisElement[];
  contentHeight: number;
  filterContainerH: number;

  // RateCards Data Source
  pagedSourceDiscrepancy: PagedList<Discrepancy>;

  // Display State: List: {Empty, NonEmpty}, Add(Stepper), Edit, 
  isLookup: boolean;
  displayedDiscrepancy: Discrepancy;

  /** search filter */
  searchForm: FormGroup;
  subForm: SubForm = {} as SubForm;;
  searchTimer;
  filtersExpanded: boolean;

  /** Report State*/
  // isDownloading: boolean;
  isReportDownloading: boolean;
  discrepancyReport$: Subscription;
  //discrepancyReportDownloaded = new Subject<any>();

  formOptions: {
    CCARateCellOptions: CCARateCell[] | null,
    CCARegionOptions: CCARegion[] | null,
    productOptions: any[] | null
  };

  monthOptions: string[];

  /** Selection */
  selection = new SelectionModel<Discrepancy>(true, []);

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private service: SharedService,
    private reportService: ReportService,
    private settingService: SettingService,
    private navService: NavigationService,
    private fb: FormBuilder) { }

  ngOnInit() {
    //MOCK
    // this.discrepancyList = D_DATA.slice(0, 50);
    this.filterContainerH = 209;
    this.initForm();
    this.initState();
    this.initSource();
    this.monthOptions = this.getMonths();
  }

  ngDoCheck() {
    // get sub-list height at every tick  
    this.contentHeight = this.reconView && this.reconView.nativeElement.offsetHeight;
    this.filterContainerH = this.filtersView && this.filtersView.nativeElement.offsetHeight;
    // console.log(this.filterContainerH)
  }

  ngOnDestroy() {
    // this.saveFilters();

    this.discrepancyListChanged$.unsubscribe();
    this.discrepancyUpdated$.unsubscribe();

    if (this.searchForm$)
      this.searchForm$.unsubscribe();
  }

  initForm(formValue?: any) {
    this.searchForm = this.fb.group({
      discoverDateStart: new FormControl(''),
      discoverDateEnd: new FormControl(''),
      resolutionDateStart: new FormControl(''),
      resolutionDateEnd: new FormControl(''),
      // includeResolved: new FormControl(''),
      // hasComment: new FormControl(''),
      varianceSign: new FormControl(''),
      months: new FormControl([]),
      programs: new FormControl([]),
      ccaRateCellIds: new FormControl([]),
      discrepancyStatusIDs: new FormControl([]),
      assigneeIDs: new FormControl([]),
      discrepancyTypes: new FormControl([]),
      memberEnrollmentStatus: new FormControl(''),
      // typeRegion: new FormControl(null),
      // typePatientPay: new FormControl(null),
      // typePatientSpendDown: new FormControl(null),
      // typePaymentError: new FormControl(null),

    }, {
        validator: this.dateInputValidator
      });
  }

  initState() {
    // OPTION INIT
    // this.service.rateCardOptionReady$.subscribe(() => {
    //    this.formOptions = this.service.getRateCardFormOptions();
    // })

    /** Discrepancy List Changed $ */
    this.discrepancyListChanged$ = this.service.disrepancyListChanged.subscribe((result: PagedList<Discrepancy>) => {
      this.pagedSourceDiscrepancy = result;
      this.searchForm.enable({ emitEvent: false });
      this.isLookup = false;
    })

    /** Discrepancy Item In-line Updated $ */
    this.discrepancyUpdated$ = this.service.discrepancyUpdated.subscribe((discrepancys: Discrepancy[]) => {
      let rawPagedSource = { ...this.pagedSourceDiscrepancy };
      let discrepancyUpdated = discrepancys[0];
      let displayIndex;
      let assignchange;
      rawPagedSource.list.map((discrepnacy: Discrepancy) => {
        if (discrepnacy.discrepancyID != discrepancyUpdated.discrepancyID) {
          return discrepnacy;
        }
        // console.log(discrepnacy === discrepancyUpdated)
        // assignChanged
        // console.log(discrepnacy, discrepancyUpdated.assigned_UserID, discrepnacy.assigned_UserID !== discrepancyUpdated.assigned_UserID)
        assignchange = discrepancys[1].assigned_UserID !== discrepancyUpdated.assigned_UserID;

        // status.display
        let discrepancyStatusUpdated = this.settingService.getOptions('discrepancyStatus').find((discrepancyStatusOption: DiscrepancyStatusOption) =>
          discrepancyStatusOption.discrepancyStatusID === discrepancyUpdated.discrepancyStatusID)
        let isDIsplayed = discrepancyStatusUpdated ? discrepancyStatusUpdated.discrepancyCategoryDisplay : true;

        if (!isDIsplayed) {
          displayIndex = discrepnacy.discrepancyID;
          //rawPagedSource.count--
        }

        discrepnacy = { ...discrepancyUpdated };
        return discrepnacy;

      });

      // console.log(displayIndex)
      // remove undisplayed row

      rawPagedSource.list = rawPagedSource.list.filter((discrepancy) =>
        discrepancy.discrepancyID !== displayIndex
      );


      // console.log(rawPagedSource);
      this.pagedSourceDiscrepancy = rawPagedSource;
      this.openSnackBar("Update Successed", "Dismiss")
    })

    /** Auto Search */
    // this.searchForm$ = this.searchForm.valueChanges.subscribe(() => {
    //    this.onSearch();
    // })
  }

  initSource() {
    this.pagedSourceDiscrepancy = this.service.getpagedListInl();
    this.isLookup = true;

    let searchForm: any = {};
    /**   Report Redirect */
    if (this.navService.hasNavData('discrepancies')) {
      const navParams = this.navService.onNaved();
      searchForm = navParams['data'];
      this.subForm.includeResolved = searchForm['includeResolved'];
      /**   Local Storage */
    } else if (localStorage.getItem('discrepancylist')) {
      const discrepancyParams = JSON.parse(localStorage.getItem('discrepancylist'));
      searchForm = discrepancyParams.searchform;

      /**   Local Storage with no filter applied */
      let discrepancyParamsIsEmpty = !!discrepancyParams.searchform;

      for (const key in searchForm) {
        // console.log(key, searchForm[key])
        if (!(searchForm[key] === null
          || searchForm[key] === undefined
          || searchForm[key] === ""
          || (
            Array.isArray(searchForm[key])
            && searchForm[key].length === 0)
        )) {
          discrepancyParamsIsEmpty = false;
          break;
        }
      }

      if (discrepancyParamsIsEmpty) {
        let startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
        searchForm = { months: [startOfMonth] };
      }
      /**   Local Storage is empty */
    } else {
      let startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
      searchForm = { months: [startOfMonth] };

    }

    /** @Todo Seperate Main/Sub list in more elegant way  */
    this.service.getDiscrepancies({}, searchForm, false);

    // Delete include Resolved, due it's not in searchForm
    delete searchForm['includeResolved'];
    this.searchForm.patchValue(searchForm, { emitEvent: false });

    for (const key in searchForm) {
      if (searchForm[key]) {
        console.log(searchForm[key], key, this.searchForm.get(key))
        this.searchForm.get(key).markAsDirty();
      }
    }

  }

  onListPagedSorted(e) {
    /** @Todo Seperate Main/Sub list in more elegant way  */
    this.isLookup = true;
    this.searchForm.disable({ emitEvent: false });
    this.service.getDiscrepancies(e, { ...this.subForm, ...this.searchForm.value }, false);
  }

  getOptions(option: string, product?: string): any[] {
    return this.settingService.getOptions(option, product);
  }

  dateInputValidator(form: FormGroup) {
    const condition = form.get('discoverDateStart').getError('matDatepickerParse')
      || form.get('discoverDateEnd').getError('matDatepickerParse')
      || form.get('resolutionDateStart').getError('matDatepickerParse')
      || form.get('resolutionDateEnd').getError('matDatepickerParse');

    // console.log('discoverDateStart', form.get('discoverDateStart').getError('matDatepickerParse') )
    return condition ? { dateInputError: true } : null;
  }

  fireWhenEmpty(el, formControlName: string): void {
    if (!el.value || el.value === '') {
      this.searchForm.patchValue({ [formControlName]: '' }, { emitEvent: true })
    }
  }

  onLocalSearch(e) {
    const pageState = {
      orderBy: e.orderBy,
      pageIndex: e.pageIndex,
      pageSize: e.pageSize,
      sortBy: e.sortBy,
    }
    this.subForm = {
      CCAID: e.CCAID,
      MMIS_ID: e.MMIS_ID,
      Name: e.Name,
      hasComment: e.hasComment,
      includeResolved: e.includeResolved,
    }
    /** @Todo Seperate Main/Sub list in more elegant way  */
    this.isLookup = true;
    this.searchForm.disable({ emitEvent: false });
    this.service.getDiscrepancies(pageState, { ...this.subForm, ...this.searchForm.value }, false);
  }

  onSearch() {
    // console.log('onSearch', ...this.searchForm.value, this.searchForm.get('ccaRateCellIds') )

    // clearTimeout(this.searchTimer)
    // prevent search fired when form invalid
    if (!this.searchForm.valid) {
      return;
    }

    // this.searchTimer = setTimeout(() => {
    // console.log(this.searchForm.value);
    this.isLookup = true;
    this.searchForm.disable({ emitEvent: false });
    /** @Todo Seperate Main/Sub list in more elegant way  */
    this.service.getDiscrepancies({}, { ...this.subForm, ...this.searchForm.value }, false);
    /** due to MatSortable also fire same event */
    // this.service.resetSort();
    // }, 2000);
  }

  clearAllFilters() {
    this.searchForm.reset();
  }

  onUpdate(e) {
    this.service.updateDiscrepancy(e[0], e[1]);
  }

  // Temp Solution for Month
  getMonths() {
    // Revrec2 file processing back to 2018-01-01
    const monthStart = '2018-01-01';

    const e = new Date(Date.parse(monthStart));
    const eMonth = e.getUTCMonth() + 1;
    const eYear = e.getFullYear();

    const current = new Date();
    const currentMonth = current.getUTCMonth() + 1;
    const currentYear = current.getFullYear();

    let months = [];
    for (let year = currentYear; year > eYear; year--) {
      for (let month = 12; month >= 1; month--) {
        if (year === eYear && month < eMonth) {
          break;
        } else if (year !== currentYear || (year === currentYear && month <= currentMonth)) {
          const mon = `${year}-${month > 9 ? month : "0" + month}-01`;
          months.push(mon);
        }
      }
    }
    return months;
  }

  openSnackBar(message: string, action: string, duration: number = 1) {
    const config = duration ? {
      duration: duration * 1000
    } : null;

    return this._snackBar.open(message, action, config);
  }

  onDiscrepancyDetailClick(e) {
    this.displayedDiscrepancy = e;
  }

  onDiscrepancyDetailDismissed() {
    this.displayedDiscrepancy = null;
  }

  saveFilters() {
    if (this.searchForm.dirty || this.searchForm) {
      let discrepacnyParam = {
        searchform: this.searchForm.value,
        subform: this.subForm
      };
      localStorage.setItem('discrepancylist', JSON.stringify(discrepacnyParam));
    }

    this.openSnackBar('Filters Saved', 'Dismiss');
  }

  getMatSelectTriggerFirstValue(formName: string, triggerValue: string, optionName: string, optionIdName: string, ) {
    if (this.searchForm.value[formName] && this.searchForm.value[formName].length) {
      var firstValue = this.getOptions(optionName).find(option =>
        option[optionIdName] === this.searchForm.value[formName][0])[triggerValue];
      return this.searchForm.value[formName].length > 1 ? (firstValue as string).slice(0, 11) + ".." : firstValue;
    } else {
      return ''
    }
  }

  downLoad() {
    this.isReportDownloading = true;
    this.discrepancyReport$ = this.service
      .getDiscrepancyReport({}, { ...this.subForm, ...this.searchForm.value })
      .subscribe(result => {
        this.isReportDownloading = false;
        // console.log(" Get Discrepancy Report =>", result.data)
        this.openSnackBar('Download Finished', 'Ok', 2);

        const FILENAME = `Revrec2Discrepancies_${moment().format('MMM_DD_YYYY_hhmmA')}.csv`;
        this.reportService.downloadTest(result.data.list, FILENAME);
      });

    const _snakbar: MatSnackBarRef<any> = this.openSnackBar('Download....', 'Abort', 0);
    // console.log(_snakbar.instance)
    const snakbar$ = _snakbar.onAction().subscribe(() => {
      // console.log('abort')
      this.abortDownload();
    });
  }

  isReportReady() {
    return !this.isLookup && this.pagedSourceDiscrepancy.count > 0
  }

  displayMoreFilters() {
    this.filtersExpanded = !this.filtersExpanded;
  }

  abortDownload() {
    if (this.discrepancyReport$)
      this.discrepancyReport$.unsubscribe();
    this.isReportDownloading = false;
  }
}
