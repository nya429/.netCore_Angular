import { AuthService } from 'src/app/auth/auth.service';
import { universalSearchTrigger } from './../../navigation/navigation.animation';
import { MemberService } from './../member.service';
import { MemberPaged, MemberName } from './../../model/member.model';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, Input, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

// import { ELEMENT_DATA, PeriodicElement } from 'src/app/MOCK_DATA';
import { SelectionModel } from '@angular/cdk/collections';
import { Sort, PageEvent, MatSort, MatSortable } from '@angular/material';
import { FormControl, FormGroup } from '@angular/forms';
import { columnExpandTrigger } from '../member.animation';
import { filter } from 'rxjs/operators';
import { PagedList } from 'src/app/model/response.model';
import { execLenValidator, minLenValidator } from 'src/app/shared/date.validate.directive';
import { Subscription } from 'rxjs';
import { strictEqual } from 'assert';


const ColumnsSetting: string[] = [
  'select',
  'name',
  'mmiS_MMIS_ID',
  'ccaid',
  'product',
  'eligibility',
  // 'dob', 
  'enrollment',
  'rating_category',
  'totalAssigned',
  'totalDiscrepancies',
  'maxAging',
  'absoluteVarianceSum'];

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [columnExpandTrigger]
})
export class MemberListComponent implements OnInit, OnDestroy {
  private memberNamesFetched$: Subscription;
  private searchForm$: Subscription;
  private singleMemberListFetch$: Subscription;
  private router$: Subscription;

  /** Patrick Loading */
  interval;
  nyan_str = "  Patrick..  Patrick..  Where are you......    ";
  nyan_index = 10;

  // MOCK
  // @Input('source') members: PeriodicElement[];

  @Input('isLookup') containerSourceLookUp: boolean;
  // @Input('isLookup') containerSourceLookUp: boolean;
  @Input('bulkUpdatePermissions') bulkUpdatePermissions: string;
  @Input('bulkUpdateByFilterPermissions') bulkUpdateByFilterPermissions: string;
  @Input('infoPermissions') infoPermissions: string;
  @ViewChild('table') private tableContainer: ElementRef;
  @ViewChild(MatSort) sort: MatSort;

  @Output() onPagedAndSorted = new EventEmitter<any>();
  @Output() actionClicked = new EventEmitter<void>();
  @Output() memberSelected = new EventEmitter<SelectionModel<MemberPaged>>();
  /** @Output() memberSelected = new EventEmitter<SelectionModel<PeriodicElement>>(); */

  /**  Local list  */
  pagedData: MemberPaged[];

  /** Table Source State: @Input */
  private _dateSourcePaged: PagedList<MemberPaged>;

  @Input('sourcePaged')
  set dateSourcePaged(dateSourcePaged: PagedList<MemberPaged>) {
    this._dateSourcePaged = dateSourcePaged;
    this.pagedData = [...this._dateSourcePaged.list];
    this.pageState.count = this.dateSourcePaged.count;
    this.pageState.pageSize = this.dateSourcePaged.pageSize;
    this.pageState.pageIndex = this.dateSourcePaged.pageIndex;
    // if (this.isPatrick()) {
    //   return;
    // }
    this.membersLoading = false;
    this.selection.clear();
  };

  get dateSourcePaged(): PagedList<MemberPaged> {
    return this._dateSourcePaged;
  }

  /**  Local Form  */
  searchForm: FormGroup;
  searchTimer;

  /** default sort */
  defaultSort: MatSortable = {
    id: '',
    start: 'desc',
    disableClear: true
  };

  /** Table Column State */
  displayedColumns: string[] = ColumnsSetting.slice();

  //MOCK
  // dataSource: PeriodicElement[];

  /** loading flag, default false */
  membersLoading: boolean;

  /**  Selection State
   *     1. member multiple selection
  */

  /** selection = new SelectionModel<PeriodicElement>(true, []);  */
  selection = new SelectionModel<MemberPaged>(true, []);

  /** 
   *  @PaginationState 
   *  data.Source.lenth will be used only for the first time
   *  pageIndex
   *  pageSize
   *  sortCloumn
   *  sortDirection
   *  pageSizeOptions
  */
  pageSizeOptions: number[];
  pageState = {
    count: 0,
    pageIndex: 0,
    pageSize: 50,
    sortBy: "absoluteVarianceSum",
    orderBy: 1
  }


  options: string[] = ['One', 'Two', 'Three'];

  /** hight light the Selected */
  selectedPatientID: number;

  /** Memebr Names */
  memberNameOptions: MemberName[]

  numbericChangePatientId: number;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private service: MemberService,
    private authService: AuthService) { }

  ngOnInit() {
    this.initForm();
    this.onStateInit();
  }

  ngOnDestroy() {
    this.memberNamesFetched$.unsubscribe();
    this.singleMemberListFetch$.unsubscribe();
    this.router$.unsubscribe();

    this.searchForm$.unsubscribe();

    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  initForm() {
    this.searchForm = new FormGroup({
      includeZeroDiscrepancy: new FormControl(0),
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
    this.pageSizeOptions = [50, 75, 100];

    if (!this.isAuthorized('bulk_update') || !this.isAuthorized('bulk_update_filter')) {
      this.displayedColumns.shift();
    }

    this.getChildParams();

    this.router$ = this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
    ).subscribe(() => {
      this.getChildParams();
    });

    this.searchForm$ = this.searchForm.valueChanges.subscribe(() => this.onSearch());
    // this.searchForm.get('Name').valueChanges.subscribe(() => this.getNames());
    this.memberNamesFetched$ = this.service.memberNamesFetched.subscribe((names: MemberName[]) => {
      this.memberNameOptions = names;
    });


    /** After discrepancy list update => single member refreshed */
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
  onPage(e: PageEvent): void {
    // console.log(e, this.pageState);
    this.pageState.pageIndex = e.pageIndex;
    this.pageState.pageSize = e.pageSize;
    this.onPagedAndSorted.emit({ ...this.searchForm.value, ...this.pageState });
    this.membersLoading = true;
  }

  /** @Output */
  onSort(e: Sort): void {
    this.pageState.sortBy = e.direction ? e.active : null;
    this.pageState.orderBy = e.active ? (e.direction === 'asc' ? 0 : 1) : 1;
    this.pageState.pageIndex = 0;
    this.onPagedAndSorted.emit({ ...this.searchForm.value, ...this.pageState });
    this.membersLoading = true;
  }

  /** @Output */
  onMemebrSelect(row) {
    this.selection.toggle(row);

    //Output
    this.memberSelected.emit(this.selection);
  }

  /** @Output */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.pagedData.forEach(row => this.selection.select(row));

    //Output
    this.memberSelected.emit(this.selection);
  }

  onClick(): void {
    this.displayedColumns.includes('rating_category') ? this.displayedColumns.splice(7, 1)
      : this.displayedColumns.splice(7, 0, 'rating_category');
  }

  onRefresh() {
    this.searchForm.patchValue({
      includeZeroDiscrepancy: 0,
      Name: '',
      CCAID: '',
      MMIS_ID: ''
    }, { emitEvent: false });
    this.pageState.pageIndex = 0;
    this.pageState.sortBy = 'absoluteVarianceSum',
      this.pageState.orderBy = 1;
    this.service.getMembers({ ...this.searchForm.value, ...this.pageState });
    this.membersLoading = true;
  }

  // onMMISClick(element: PeriodicElement) {
  //   this.router.navigate(['/members', { outlets: { 'patient': [element.mmis_id] } }]);
  //   this.selectedIndex = this.dataSource.indexOf(element);
  // }
  onMMISClick(element: MemberPaged) {
    if (this.isAuthorized('info')) {
      this.router.navigate(['/members', { outlets: { 'patient': [element.masterPatientID] } }]);
    }
    // this.selectedPatientID = element.masterPatientID;
  }

  isHighlight(i: number): boolean {
    return this.selectedPatientID === i;
  }

  getChildParams(): void {
    this.selectedPatientID = this.route.firstChild
      ? +this.route.firstChild.snapshot.paramMap.get('id')
      : null;
  }

  onSearch() {
    clearTimeout(this.searchTimer)
    // prevent search fired when form invalid
    // console.log(this.searchForm.get('Name'))
    if (!this.searchForm.valid) {
      return;
    }
    // this.settPatrick();
    this.searchTimer = setTimeout(() => {
      this.pageState.pageIndex = 0;
      if (this.pageState.sortBy || this.pageState.orderBy) {
        this.sort.sort(<MatSortable>this.defaultSort);
      } else {
        this.service.getMembers({ ...this.searchForm.value, ...this.pageState });
      }

      this.membersLoading = true;
    }, 1000);
  }

  //   getNames() {
  //   if (!this.searchForm.get('Name').valid) {
  //     return;
  //   }

  //   let namePartial = this.searchForm.get('Name').value;
  //   console.log(namePartial, this.searchForm.get('Name').valid)
  //   this.service.getMemberNamesByNamePartial(namePartial)
  // }

  settPatrick() {
    if (this.isPatrick()) {


      this.interval = setInterval(() => {
        if (this.nyan_index < this.nyan_str.length) {
          this.nyan_index++

        } else {
          this.nyan_index = 0;
        }

      }, 30);
    }
  }

  getPatrick() {
    return this.nyan_str.slice(0, this.nyan_index);
  }

  isPatrick() {
    return this.searchForm && this.searchForm.get('Name').value.toLowerCase() === 'patrick';
  }

  isAuthorized(view: string) {
    switch (view) {
      case "info":
        return this.authService.isViewAuthorized(this.infoPermissions);
      case "bulk_update":
        return this.authService.isViewAuthorized(this.bulkUpdatePermissions);
      case "bulk_update_filter":
        return this.authService.isViewAuthorized(this.bulkUpdateByFilterPermissions);
      default:
        return false;
    }
  }
}
