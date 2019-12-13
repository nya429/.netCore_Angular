import { stringify } from '@angular/compiler/src/util';
import { SharedService } from './../../shared/shared.service';
import { Discrepancy } from './../../model/discrepancy.model';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

// import { DisElement, ELEMENT_DATA, D_DATA } from 'src/app/MOCK_DATA';
import { PagedList } from 'src/app/model/response.model';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SettingService } from 'src/app/setting/setting.service';
import { Subscription } from 'rxjs';
import { CCARateCell, CCARegion, DiscrepancyStatusOption } from 'src/app/model/setting.model';

@Component({
  selector: 'app-discrepancy-container',
  templateUrl: './discrepancy-container.component.html',
  styleUrls: ['./discrepancy-container.component.css']
})
export class DiscrepancyContainerComponent implements OnInit, OnDestroy {
  @ViewChild('reconList') reconView: ElementRef;
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

  // RateCards Data Source
  pagedSourceDiscrepancy: PagedList<Discrepancy>;

  // Display State: List: {Empty, NonEmpty}, Add(Stepper), Edit, 
  isLookup: boolean;

  /** search filter */
  searchForm: FormGroup;
  subForm: {
    CCAID: number,
    MMIS_ID: string,
    Name: number,
    includeResolved: boolean,
    hasComment: boolean
  }
  searchTimer;

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
    private settingService: SettingService,
    private fb: FormBuilder) { }

  ngOnInit() {
    //MOCK
    // this.discrepancyList = D_DATA.slice(0, 50);

    this.initForm();
    this.initState();
    this.initSource();
    this.monthOptions = this.getMonths();
  }

  ngDoCheck() {
    // get sub-list height at every tick  
    this.contentHeight = this.reconView && this.reconView.nativeElement.offsetHeight;
  }

  ngOnDestroy() {
    this.discrepancyListChanged$.unsubscribe();
    this.discrepancyUpdated$.unsubscribe();
    this.searchForm$.unsubscribe();

    if (this.searchForm.dirty || this.searchForm) {
      let discrepacnyParam = {
        searchform: this.searchForm.value,
        subform: this.subForm
      };
      localStorage.setItem('discrepancylist', JSON.stringify(discrepacnyParam));
    }
  }

  initForm() {
    this.searchForm = this.fb.group({
      discoverDateStart: new FormControl(''),
      discoverDateEnd: new FormControl(''),
      resolutionDateStart: new FormControl(''),
      resolutionDateEnd: new FormControl(''),
      // includeResolved: new FormControl(''),
      // hasComment: new FormControl(''),
      months: new FormControl(''),
      programs: new FormControl(''),
      ccaRateCellIds: new FormControl(''),
      discrepancyStatusIDs: new FormControl(''),
      assigneeIDs: new FormControl(''),
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


    this.searchForm$ = this.searchForm.valueChanges.subscribe(() => {
      this.onSearch();
    })
  }

  initSource() {
    this.pagedSourceDiscrepancy = this.service.getpagedListInl();
    this.isLookup = true;



    if (localStorage.getItem('discrepancylist')) {
      let discrepancyParams = JSON.parse(localStorage.getItem('discrepancylist'));
      this.service.getDiscrepancies({}, { ...discrepancyParams.searchform }, false)
      this.searchForm.patchValue(discrepancyParams.searchform, { emitEvent: false });
      for (const key in discrepancyParams.searchform) {
        if (discrepancyParams.searchform[key]) {
          this.searchForm.get(key).markAsDirty();
        }
      }
    } else {
      this.service.getDiscrepancies({}, {}, false);
    }

    /** @Todo Seperate Main/Sub list in more elegant way  */

  }

  onListPagedSorted(e) {
    /** @Todo Seperate Main/Sub list in more elegant way  */
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
    this.service.getDiscrepancies(pageState, { ...this.subForm, ...this.searchForm.value }, false);
  }

  onSearch() {
    clearTimeout(this.searchTimer)
    // prevent search fired when form invalid
    if (!this.searchForm.valid) {
      return;
    }

    this.searchTimer = setTimeout(() => {
      // console.log(this.searchForm.value);
      this.isLookup = true;
      this.searchForm.disable({ emitEvent: false });
      /** @Todo Seperate Main/Sub list in more elegant way  */
      console.log(this.searchForm.value)
      this.service.getDiscrepancies({}, { ...this.subForm, ...this.searchForm.value }, false);
    }, 1500);
  }

  onUpdate(e) {
    this.service.updateDiscrepancy(e[0], e[1]);
  }

  // Temp Solution for Month
  getMonths() {
    const monthStart = '2015-01-01';

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

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
    });
  }
}
