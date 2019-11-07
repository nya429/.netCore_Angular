import { AuthService } from 'src/app/auth/auth.service';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent, Sort } from '@angular/material';
import { PagedList } from 'src/app/model/response.model';
import { RateCard } from 'src/app/model/setting.model';

@Component({
  selector: 'app-setting-ratecard-list',
  templateUrl: './setting-ratecard-list.component.html',
  styleUrls: ['./setting-ratecard-list.component.css'],
})
export class SettingRatecardListComponent implements OnInit, OnChanges {
  // TODO chenge name according to Table
  displayedColumns: string[] = ['select', 'ccaratecell', 'ccaregion', 'amount', 'startdate', 'enddate', 'product', 'eligiblity', 'activeflag', 'action'];

  private _dateSourcePaged: PagedList<RateCard>;

  @Input('updatePermissions') updatePermissions;

  @Input('sourcePaged')
  set dateSourcePaged(dateSourcePaged: PagedList<RateCard>) {
    this._dateSourcePaged = dateSourcePaged;
    this.pagedData = [...this._dateSourcePaged.list];
    this.pageState.count = this.dateSourcePaged.count;
    this.pageState.pageSize = this.dateSourcePaged.pageSize;
    this.pageState.pageIndex = this.dateSourcePaged.pageIndex;
  };

  get dateSourcePaged(): PagedList<RateCard> {
    return this._dateSourcePaged;
  }

  @Output() rateCardSelected = new EventEmitter<SelectionModel<RateCard>>();
  @Output() onPagedAndSorted = new EventEmitter<any>();
  @Output() onUpdated = new EventEmitter<RateCard[]>();
  @Output() onEditted = new EventEmitter<RateCard>();

  /** Table Source State: @Input */
  pagedData: RateCard[];

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
  selection = new SelectionModel<RateCard>(true, []);

  /** In-line editing */
  editedElement: RateCard;
  editedElementPrev: RateCard;
  editedElementNext: RateCard;
  editedField: string;
  selectObject: RateCard;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.onStateInit();
  }

  ngOnChanges() {

  }

  onStateInit() {
    this.pageSizeOptions = [20, 25, 30];

    this.displayedColumns.shift();
    if (!this.isAuthorized('update')) {
    }
  }

  /** @Output */
  onMemebrSelect(row): void {
    this.selection.toggle(row);
    this.rateCardSelected.emit(this.selection);
  }

  /** @Output */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.pagedData.forEach(row => this.selection.select(row));

    this.rateCardSelected.emit(this.selection);
  }

  isAllSelected(): boolean {
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

  onEdit(element: RateCard) {
    this.onEditted.emit(element);
  }

  onItemToggleClick(element: RateCard, field: string): void {
    // Disable Edit when discrepancyStatusType is System
    if (!this.isAuthorized('update'))
      return;

    this.editedElement = element;
    this.editedElementPrev = { ...this.editedElement };
    this.editedElementNext = { ...this.editedElement };
    this.editedElementNext.activeFlag = !this.editedElementPrev.activeFlag;
    this.onUpdated.emit([this.editedElementNext, this.editedElementPrev])
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
