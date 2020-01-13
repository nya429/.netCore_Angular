import { MemberService } from './../../member/member.service';
import { Component, OnInit, ViewChild, Output, EventEmitter, ElementRef, OnDestroy, Input } from '@angular/core';
// import { ELEMENT_DATA, PeriodicElement } from 'src/app/MOCK_DATA';
import { Sort, PageEvent } from '@angular/material';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { MemberPaged, MemberName } from 'src/app/model/member.model';
import { PagedList } from 'src/app/model/response.model';
import { execLenValidator, minLenValidator } from 'src/app/shared/date.validate.directive';

const ColumnsSetting: string[] = [
  'column1',
  'column2',
  'column3'];

@Component({
  selector: 'app-assignment-list',
  templateUrl: './assignment-list.component.html',
  styleUrls: ['./assignment-list.component.css']
})
export class AssignmentListComponent implements OnInit, OnDestroy {
  private router$: Subscription;
  private searchForm$: Subscription;
  private singleMemberListFetch$: Subscription;

  @ViewChild('table') private tableContainer: ElementRef;

  @Input('isLookup') containerSourceLookUp: boolean;
  @Input('actionUserId') actionUserId: number;

  // user For Member BulkUpdate
  @Output() actionClicked = new EventEmitter<void>();
  @Output() onPagedAndSorted = new EventEmitter<any>();
  @Output() memberSelected = new EventEmitter<SelectionModel<MemberPaged>>();

  /** Table Column State */
  displayedColumns: string[] = ColumnsSetting.slice();

  /** Table Source State: @Input */
  // dataSource = ELEMENT_DATA;
  // sortedData = ELEMENT_DATA;

  /**  Local list  */
  pagedData: MemberPaged[];

  /** loading flag, default false */
  membersLoading: boolean;


  private _dateSourcePaged: PagedList<MemberPaged>;
  @Input('sourcePaged')
  set dateSourcePaged(dateSourcePaged: PagedList<MemberPaged>) {
    this._dateSourcePaged = dateSourcePaged;
    this.pagedData = [...this._dateSourcePaged.list];
    this.pageState.count = this.dateSourcePaged.count;
    this.pageState.pageSize = this.dateSourcePaged.pageSize;
    this.pageState.pageIndex = this.dateSourcePaged.pageIndex;
    this.membersLoading = false;
    this.selection.clear();
  };

  get dateSourcePaged(): PagedList<MemberPaged> {
    return this._dateSourcePaged;
  }


  /**  Local Form  */
  searchForm: FormGroup;
  searchTimer;
  searchLoading;
  memebrNameResults: MemberName[];

  /** numberic change timer */
  interval: any;
  numbericChangePatientId: number;

  /**  Selection State
   *     1. member multiple selection
  */
  selection = new SelectionModel<MemberPaged>(true, []);

  /** pagination State 
   *  data.Source.lenth will be used only for the first time
   *  pageIndex
   *  pageSize
   *  sortCloumn
   *  sortDirection
   *  pageSizeOptions
  */

  // count = this.dataSource.length;
  // pageIndex = 0;
  // pageSize = 50;
  // sortCloumn: string;
  // sortDirection;
  pageSizeOptions: number[];
  pageState = {
    count: 0,
    pageIndex: 0,
    pageSize: 25,
    sortBy: "maxAging",
    orderBy: 1
  }

  /** 
   * Local Form 
   * 
*/
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];

  /** hight light the Selected */
  // selectedIndex: number;
  // selectedMMIS: number;

  selectedPatientID: number;

  /** sort options */
  sortOptions = [
    { symbol: 'Absolute Variance', column: 'absoluteVarianceSum' },
    { symbol: 'Max Aging', column: 'maxAging' },
    { symbol: 'Total Discrepancies', column: 'totalDiscrepancies' },
    { symbol: 'Total Assigned to Me', column: 'totalAssigned' },
  ];

  private memebrNamePartailFetched$: Subscription;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private service: MemberService,
    private memberService: MemberService) { }

  ngOnInit() {
    this.initSource();
    this.initForm();
    this.onStateInit();
    this.getChildParams();
  }

  ngOnDestroy() {
    this.router$.unsubscribe();
    this.searchForm$.unsubscribe();
    this.memebrNamePartailFetched$.unsubscribe();
    clearTimeout(this.searchTimer);
  }

  initSource() {
    this.memebrNameResults = [];
  }

  initForm() {
    this.searchForm = new FormGroup({
      includeZeroDiscrepancy: new FormControl(0),
      universalInput: new FormControl('', {
        validators: minLenValidator(3)
      }),
      Name: new FormControl('', {
        validators: minLenValidator(3)
      }),
      CCAID: new FormControl('', {
        validators: execLenValidator(10)
      }),
      MMIS_ID: new FormControl('', {
        validators: execLenValidator(12)
      }),
    });
  }

  onStateInit() {
    this.pageSizeOptions = [20, 25, 50];

    this.router$ = this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
    ).subscribe(() => {
      this.getChildParams();
    });

    this.searchForm$ = this.searchForm.valueChanges.subscribe(() => {
      this.onSearch();
    })

    this.memebrNamePartailFetched$ = this.memberService.memberNamesFetched.subscribe((result) => {
      this.searchLoading = false;
      this.memebrNameResults = result.slice(0, 5);
    })

    // After Discrepancy List Bulk Updated, single memebr refresh
    this.singleMemberListFetch$ = this.service.singleMemberListFetch.subscribe((memberupdated: MemberPaged) => {
      console.log('singleMemberListFetch', memberupdated);

      this.pagedData.forEach((memebr: MemberPaged) => {
        if (memebr.masterPatientID === memberupdated.masterPatientID) {
          this.numbericChanging(memebr, memberupdated);
        }
      })
    });
  }

  numbericChanging(memebr, memberupdated) {
    console.log('numberic change')
    this.numbericChangePatientId = memberupdated.masterPatientID;
    clearInterval(this.interval);

    const total = 10;
    let count = 0;


    let vDivided1 = (memebr.absoluteVarianceSum - memberupdated.absoluteVarianceSum) / total;
    let vDivided2 = (memebr.totalAssigned - memberupdated.totalAssigned) / total;
    let vDivided3 = (memebr.maxAging - memberupdated.maxAging) / total;
    let vDivided4 = (memebr.totalDiscrepancies - memberupdated.totalDiscrepancies) / total;

    this.interval = setInterval(() => {

      memebr.absoluteVarianceSum = this.incr(memebr.absoluteVarianceSum, memberupdated.absoluteVarianceSum, vDivided1);
      memebr.totalAssigned = this.incr(memebr.totalAssigned, memberupdated.totalAssigned, vDivided2);
      memebr.maxAging = this.incr(memebr.maxAging, memberupdated.maxAging, vDivided3);
      memebr.totalDiscrepancies = this.incr(memebr.totalDiscrepancies, memberupdated.totalDiscrepancies, vDivided4);

      count = count + 1;

      if (count === total) {
        memebr.absoluteVarianceSum = memberupdated.absoluteVarianceSum ? memberupdated.absoluteVarianceSum : 0;
        memebr.totalAssigned = memberupdated.totalAssigned ? memberupdated.totalAssigned : 0;
        memebr.maxAging = memberupdated.maxAging ? memberupdated.maxAging : 0;
        memebr.totalDiscrepancies = memberupdated.totalDiscrepancies ? memberupdated.totalDiscrepancies : 0;
        this.numbericChangePatientId = null;
        clearInterval(this.interval);
      }
    }, 70)
  }

  incr(valOrg, valNew, diff) {
    let ne = valNew ? valNew : 0
    if (diff > 0) {
      if (valOrg <= ne) {
        valOrg = ne
      } else {
        valOrg = Math.floor(valOrg - diff);
      }
    }

    if (diff < 0) {
      if (valOrg >= ne) {
        valOrg = ne
      } else {
        valOrg = Math.ceil(valOrg - diff)
      }
    }
    return valOrg;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.pagedData.length;
    return numSelected == numRows;
  }

  /** @Output */
  onMemebrSelect(row) {
    this.selection.toggle(row);
    // this.memberListService.selectMember(this.selection.selected, this.pagedData.length);
  }

  /** @Output */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.pagedData.forEach(row => this.selection.select(row));

    // this.memberListService.selectMember(this.selection.selected, this.pagedData.length);
  }

  /** @Output */
  onPage(e: PageEvent): void {
    console.log(e, this.pageState);
    this.pageState.pageIndex = e.pageIndex;
    this.pageState.pageSize = e.pageSize;
    this.onPagedAndSorted.emit({ ...this.searchForm.value, ...this.pageState });
    this.membersLoading = true;
  }

   /** @Output */
  sort(column: string) {
    this.pageState.orderBy = ((column === this.pageState.sortBy && this.pageState.orderBy === 0) ? 1 : 0);
    this.pageState.sortBy = column;
    this.pageState.pageIndex = 0;
    this.onPagedAndSorted.emit({ ...this.searchForm.value, ...this.pageState });
    this.membersLoading = true;
  }

  onCloumnunClick(): void {
    this.displayedColumns.includes('rating_category') ? this.displayedColumns.splice(7, 1)
      : this.displayedColumns.splice(7, 0, 'rating_category');
  }

  onWorkListItemClick(element: MemberPaged) {
    this.router.navigate(['/worklist', { outlets: { 'patient': [element.masterPatientID] } }]);
  }

  isHighlight(i: number): boolean {
    return this.selectedPatientID === i;
  }

  getChildParams(): void {

    this.selectedPatientID = this.route.firstChild
      ? +this.route.firstChild.snapshot.paramMap.get('id')
      : null;

    // console.log('GET CHILDPARAMS', this.selectedMMIS);
  }

  onRefresh() {
    this.pageState.pageIndex = 0;
    this.pageState.sortBy = 'maxAging';
    this.pageState.orderBy = 1;
    this.onPagedAndSorted.emit({ ...this.searchForm.value, ...this.pageState });
    this.membersLoading = true;
  }

  onSearch() {
    let ccaReg = new RegExp(/^5\d{9}$/);
    let mmisReg = new RegExp(/^1\d{11}$/);


    clearTimeout(this.searchTimer);
    if (!this.searchForm.valid) {
      return;
    }

    // if (this.searchForm.get('Name').value === '') {
    //   this.memebrNameResults = [];
    //   return;
    // }

    let value = this.searchForm.get('universalInput').value;
    let isCCA = ccaReg.test(value);
    let isMMIS = mmisReg.test(value);

    if (isCCA) {
      this.searchForm.patchValue({ CCAID: value, Name: '', MMIS_ID: '' }, { emitEvent: false });
    } else if (isMMIS) {
      this.searchForm.patchValue({ CCAID: '', Name: '', MMIS_ID: value }, { emitEvent: false });
    } else {
      this.searchForm.patchValue({ CCAID: '', Name: value, MMIS_ID: '' }, { emitEvent: false });
    }

    this.searchTimer = setTimeout(() => {
      this.pageState.pageIndex = 0;
      // console.log(this.searchForm.value)
      this.onPagedAndSorted.emit({ ...this.searchForm.value, ...this.pageState });
      this.membersLoading = true;
      // this.memberService.getMemberNamesByNamePartial(this.searchForm.get('Name').value);
      this.searchLoading = true;

    }, 500);
  }
}
