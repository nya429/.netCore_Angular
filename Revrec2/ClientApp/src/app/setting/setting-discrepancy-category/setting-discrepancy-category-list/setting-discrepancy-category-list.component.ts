import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent, Sort } from '@angular/material';
import { DiscrepancyCategory } from 'src/app/model/setting.model';
import { PagedList } from 'src/app/model/response.model';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-setting-discrepancy-category-list',
  templateUrl: './setting-discrepancy-category-list.component.html',
  styleUrls: ['./setting-discrepancy-category-list.component.css']
})
export class SettingDiscrepancyCategoryListComponent implements OnInit {
  @Input('source') dataSource: DiscrepancyCategory[];

  private _dateSourcePaged: PagedList<DiscrepancyCategory>;

  @Input('updatePermissions') updatePermissions;

  @Input('sourcePaged')
  set dateSourcePaged(dateSourcePaged: PagedList<DiscrepancyCategory>) {
    this._dateSourcePaged = dateSourcePaged;
    this.pagedData = [...this._dateSourcePaged.list];
    this.pageState.count = this.dateSourcePaged.count;
    this.pageState.pageSize = this.dateSourcePaged.pageSize;
    this.pageState.pageIndex = this.dateSourcePaged.pageIndex;
  };

  get dateSourcePaged(): PagedList<DiscrepancyCategory> {
    return this._dateSourcePaged;
  }

  @Output() discrepancyCategorySelected = new EventEmitter<SelectionModel<DiscrepancyCategory>>();
  @Output() onPagedAndSorted = new EventEmitter<any>();
  @Output() onUpdated = new EventEmitter<DiscrepancyCategory[]>();
  @Output() onEditted = new EventEmitter<DiscrepancyCategory>();

  /** Column Def */
  displayedColumns: string[] = ['category', 'description', 'display', 'active', 'action'];

  /** Table Source State: @Input */
  // sortedData: DiscrepancyCategory[];
  pagedData: DiscrepancyCategory[];

  pageSizeOptions: number[];

  pageState = {
    count: 0,
    pageIndex: 0,
    pageSize: 25,
    sortBy: "",
    orderBy: 0
  }

  /**  Selection State
 *     1. member multiple selection
*/
  selection = new SelectionModel<DiscrepancyCategory>(true, []);

  /** In-line editing */
  editedElement: DiscrepancyCategory;
  editedElementPrev: DiscrepancyCategory;
  editedElementNext: DiscrepancyCategory;
  editedField: string;
  selectObject: DiscrepancyCategory;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.onStateInit();
  }

  onStateInit() {
    // this.sortedData = this.dataSource;
    // this.pagedData = this.dataSource
    this.pageSizeOptions = [20, 25, 30];

    if (!this.isAuthorized('update')) {
      this.displayedColumns.pop();
    }
  }

  /** @Output */
  onMemebrSelect(row) {
    this.selection.toggle(row);
    this.discrepancyCategorySelected.emit(this.selection);
  }

  /** @Output */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.pagedData.forEach(row => this.selection.select(row));

    // this.memberListService.selectMember(this.selection.selected, this.pagedData.length);
    this.discrepancyCategorySelected.emit(this.selection);
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.pagedData.length;
    return numSelected == numRows;
  }

  onPage(e: PageEvent): void {
    this.pageState.pageIndex = e.pageIndex;
    this.pageState.pageSize = e.pageSize;
    this.onPagedAndSorted.emit(this.pageState);
  }

  onSort(e: Sort): void {
    this.pageState.sortBy = e.direction ? e.active : null;
    this.pageState.orderBy = e.direction ? (e.direction === 'asc' ? 0 : 1) : null;
    this.pageState.pageIndex = 0;
    this.onPagedAndSorted.emit(this.pageState);
  }

  onItemToggleClick(element: DiscrepancyCategory, field: string): void {

    if (!this.isAuthorized('update'))
      return;

    this.editedElement = element;
    this.editedElementPrev = { ...this.editedElement };
    this.editedElementNext = { ...this.editedElement };
    this.editedElementNext[field] = !this.editedElementPrev[field];
    // console.log(element, this.editedElementPrev[field], this.editedElementNext[field], )
    this.onUpdated.emit([this.editedElementNext, this.editedElementPrev])
  }

  onEdit(element: DiscrepancyCategory) {
    this.onEditted.emit(element);
  }

  isAuthorized(view: string) {
    switch (view) {
      case "update":
        return this.authService.isViewAuthorized(this.updatePermissions);
      default:
        return false;
    }
  }

}

