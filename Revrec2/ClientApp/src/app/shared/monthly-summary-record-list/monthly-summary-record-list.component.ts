import { MemberRevYear, MonthlySummary } from './../../model/monthlysummary.model';
import { SharedService } from './../shared.service';
import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Sort, MatSnackBar, MatDialog, PageEvent } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { switchMap } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

// import { PeriodicElement, ELEMENT_DATA, DisElement } from 'src/app/MOCK_DATA';
import { DiscreapcnyUpdateDialogComponent } from '../discrepancy-update-dialog/discrepancy-update-dialog.component';

const ColumnsSetting: string[] = [
  // 'select',
  // 'name',
  // 'mmis_id',
  // 'cca_id',
  // 'program',
  'month',
  'org_ratecell',
  'org_region',
  'org_premium',
  'org_pp',
  'org_sp',
  'org_expect',
  'payor_ratecell',
  'payor_region',
  'payor_premium',
  'payor_pp',
  'payor_sp',
  'payor_paid',
  'unexplained',
  'variance',
  // 'flag',
  // 'status',
  // 'assigned',
  // 'due_date',
  // 'aging',
  // 'actions'
]

@Component({
  selector: 'app-monthly-summary-record-list',
  templateUrl: './monthly-summary-record-list.component.html',
  styleUrls: ['./monthly-summary-record-list.component.css'],
})
export class MonthlySummaryRecordListComponent implements OnInit, OnInit, OnChanges, OnDestroy {
  @ViewChild('table') private tableContainer: ElementRef;
  /** Table Container State: @Input */
  @Input() containerH: number;
  @Input() isSubList: boolean;
  @Input() mockMSR: boolean;

  private _masterPatientId: number;

  @Input('masterPatientId')
  set masterPatientId(masterPatientId: number) {
    this._masterPatientId = masterPatientId;
    this.service.getMemberRevYearsByPatientID(masterPatientId);
  };

  get masterPatientId(): number {
    return this._masterPatientId;
  }

  private memberYearsChanged$: Subscription;
  private monthlySummaryChanged$: Subscription;
  private dialogClose$: Subscription;

  memberYears: MemberRevYear[] = [];

  pagedData: MonthlySummary[] = [];


  /** Non Revenue Month */
  nonRevenueMonths: string[];


  /** Table Column State */
  displayedColumns: string[] = ColumnsSetting.slice();

  /** Table Source State: @Input */
  @Input() source: any[];

  dataSource;
  // sortedData = this.dataSource;
  // pagedDataMOCK = this.dataSource;

  /** loading flag, default false */
  isLookup = true;

  /**  Selection State
   *     1. member multiple selection
  */
  selection = new SelectionModel<any>(true, []);

  pageSizeOptions: number[] = [12];
  pageState = {
    count: 0,
    pageIndex: 0,
    pageSize: 12,
    sortBy: "month",
    orderBy: 1
  }



  constructor(private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private service: SharedService,
    // test dialog
    public dialog: MatDialog) { }

  ngOnInit() {
    this.initState();
  }

  initState() {
    // Set Revenue Years;
    // Send Latest Year request
    this.memberYearsChanged$ = this.service.monthYearFetched.subscribe((years: MemberRevYear[]) => {
      this.memberYears = years;
      this.trimNonRevenunYears();
      let latestRevenueYear = this.memberYears.length !== 0 ? this.memberYears[0].memberYear : new Date().getFullYear();
      this.service.getMemebrMonthlySummaryrByYear(this.masterPatientId, latestRevenueYear);

      // Assume A Revenue Year have 12 months
      this.pageState.count =this.memberYears.length * 12,
      this.pageState.pageIndex = 0;

    });

    this.monthlySummaryChanged$ = this.service.monthlySummaryListChanged.subscribe(data => {
      this.pagedData = data.list;
      this.fillMonthGap();
      this.pagedData.sort((prev, next) => Date.parse(next.memberMonth) - Date.parse(prev.memberMonth));
      this.isLookup = false;
    });
  }

  ngOnDestroy() {
    this.monthlySummaryChanged$.unsubscribe();
    this.memberYearsChanged$.unsubscribe();
    if (this.dialogClose$) {
      this.dialogClose$.unsubscribe();
    }
  };

  ngOnChanges() {

  }


  trimNonRevenunYears() {
    let index = this.memberYears.findIndex(year => year.gap === 0);
    if (index === -1) {
      this.memberYears = [];
      return;
    }


    this.memberYears.splice(0, index);
    this.memberYears.sort((prev, next) => next.memberYear - prev.memberYear);
    index = this.memberYears.findIndex(year => year.gap === 0);
    this.memberYears.splice(0, index);
  }

  fillMonthGap() {
    let year;
    if (!this.pagedData || this.pagedData.length === 0) {
      year = new Date().getFullYear().toString();
    } else {
      year = this.pagedData[0].memberMonth.slice(0, 4);
    }

    // For each year
    const MONTHS = 12;
    this.nonRevenueMonths = Array();

    // get every months
    let months: string[] = new Array();

    for (var i = 0; i < MONTHS; i++) {
      let mon = i + 1 >= 10 ? (i + 1) : `0${i + 1}`
      months.push(`${year}-${mon}-01T00:00:00`);
    }

    //  get months that source don't have msr
    let a = months.filter(m => !this.pagedData.find(d => d.memberMonth === m))
    this.nonRevenueMonths = this.nonRevenueMonths.concat(a);

    this.nonRevenueMonths.forEach(m => this.pagedData.push(
      {
        "monthlySummaryRecordID": null,
        "masterPatientID": this.masterPatientId,
        "mmiS_ID": null,
        "memberMonth": m,
        "variance": 0.00,
        "paymentError": 0.00,
        "baseCapitationAmount": 0.00,
        "patientPayAmountN": 0.00,
        "patientPayAmountSCO": 0.00,
        "paidCapitationAmount": 0.00,
        "ccaRateCellID": 99,
        "ccaRegionID": 99,
        "ccaRateCell": '99',
        "ccaRegion": 'NA',
        "ccaPatientPay": 0.00,
        "ccaPatientSpendDown": 0.00,
        "ccaRateCardID": 0,
        "ccaAmount": 0.00,
        "ccaNetAmount": 0.00,
        "mmisRateCellID": 99,
        "mmisRegionID": 99,
        "mmisRateCell": '99',
        "mmisRegion": 'NA',
        "mmisPatientPay": 0.00,
        "mmisPatientSpendDown": 0.00,
        "mmisRateCardID": 99,
        "mmisAmount": 0.00,
        "mmisNetAmount": 0.00
      },
    ));
  }


  // @MOCK
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.pagedData.length;
    return numSelected == numRows;
  }

  // @MOCK
  /** @Output */
  onMemebrSelect(row): void {
    this.selection.toggle(row);
    // this.memberListService.selectMember(this.selection.selected, this.pagedData.length);
  }

  // @MOCK
  /** @Output */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.pagedData.forEach(row => this.selection.select(row));
    // console.log(this.dataSource);
    // this.memberListService.selectMember(this.selection.selected, this.pagedData.length);
  }

  onSort(e: Sort) {
    const sortBy = e.direction ? e.active : null;
    const orderBy = e.direction ? (e.direction === 'asc' ? 0 : 1) : 1;
    switch (sortBy) {
      case 'month': {
        if (orderBy === 0) {
          // asc sort
          const d = [...this.pagedData.sort((prev, next) => Date.parse(prev.memberMonth) - Date.parse(next.memberMonth))];
          this.pagedData = d;
        } else {
          // desc sort
          const d = [...this.pagedData.sort((prev, next) => Date.parse(next.memberMonth) - Date.parse(prev.memberMonth))];
          this.pagedData = d;
        }
        return;
      }

      default:
        // desc sort
        const d = [...this.pagedData.sort((prev, next) => Date.parse(next.memberMonth) - Date.parse(prev.memberMonth))];
        this.pagedData = d;
        return;
    }
  }

  isBubbleLighted(element: MonthlySummary,
    option: string): boolean {
    if (!element) {
      return false;
    }

    switch (option) {
      case 'va':
        return element.variance !== 0;
      case 'pe':
        return element.paymentError !== 0;
      default:
        return false;
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1500,
    });
  }

  getTotal(cloumn: string): number {
    return this.pagedData.map(t => t[`${cloumn}`]).reduce((acc, value) => acc + value, 0).toFixed(2);
  }

  // TODO When year is gap fire mock up
  onPage(event: PageEvent) {
    this.isLookup = true;
    this.pageState.pageIndex = event.pageIndex;
    let year = this.memberYears[event.pageIndex].memberYear;
    this.service.getMemebrMonthlySummaryrByYear(this.masterPatientId, year);
  }

  // @MOCK
  openDialog(): void {
    const dialogRef = this.dialog.open(DiscreapcnyUpdateDialogComponent, {
      height: '500px',
      width: '400px',
      data: { selection: this.selection, type: 'discrepancy' }
    });

    this.dialogClose$ = dialogRef.afterClosed().subscribe(result => {
      if (!result || result === '')
        return;

      // console.log(result, this.selection.selected);
      this.selection.selected.map((discrepancy: any) => {
        // console.log(discrepancy['dueDate'], result.dueDate)
        discrepancy['status'] = result.status ? result.status : discrepancy['status'];
        discrepancy['assigned'] = result.assignee ? result.assignee : discrepancy['assigned'];
        discrepancy['dueDate'] = result.dueDate ? result.dueDate : discrepancy['dueDate']
      })

      this.openSnackBar(`${this.selection.selected.length} Discrepancy Update Sucessfully`, 'Dismiss');
      this.selection.clear();
    });
  }

  isNonRevenueMonth(element: MonthlySummary): boolean {
    return this.nonRevenueMonths.includes(element.memberMonth);
  }

}



