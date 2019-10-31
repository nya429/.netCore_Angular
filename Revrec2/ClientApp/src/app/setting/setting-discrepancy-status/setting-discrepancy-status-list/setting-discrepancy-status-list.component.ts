import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { SettingService } from '../../setting.service';
import { PageEvent, Sort } from '@angular/material';
import { DiscrepancyStatus } from 'src/app/model/setting.model';
import { PagedList } from 'src/app/model/response.model';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-setting-discrepancy-status-list',
  templateUrl: './setting-discrepancy-status-list.component.html',
  styleUrls: ['./setting-discrepancy-status-list.component.css']
})
export class SettingDiscrepancyStatusListComponent implements OnInit {
  @Input('source') dataSource: DiscrepancyStatus[];

  private _dateSourcePaged: PagedList<DiscrepancyStatus>;

  @Input('updatePermissions') updatePermissions;

  @Input('sourcePaged')
  set dateSourcePaged(dateSourcePaged: PagedList<DiscrepancyStatus>) {
    this._dateSourcePaged = dateSourcePaged;
    this.pagedData = [...this._dateSourcePaged.list];
    this.pageState.count = this.dateSourcePaged.count;
    this.pageState.pageSize = this.dateSourcePaged.pageSize;
    this.pageState.pageIndex = this.dateSourcePaged.pageIndex;
  };

  get dateSourcePaged(): PagedList<DiscrepancyStatus> {
    return this._dateSourcePaged;
  }

  @Output() discrepnacyStatusSelected = new EventEmitter<SelectionModel<DiscrepancyStatus>>();
  @Output() onPagedAndSorted = new EventEmitter<any>();
  @Output() onUpdated = new EventEmitter<DiscrepancyStatus[]>();

  /** Column Def */
  displayedColumns: string[] = ['select', 'status', 'category', 'discrepnacyType', 'active'];

  /** Table Source State: @Input */
  // sortedData: DiscrepancyStatus[];
  pagedData: DiscrepancyStatus[];

  /** 
   *  @PaginationState 
   *  data.Source.lenth will be used only for the first time
   *  pageIndex
   *  pageSize
   *  sortCloumn
   *  sortDirection
   *  pageSizeOptions
  */
  // count: number;
  // pageIndex: number;
  // pageSize: number;
  // sortCloumn: string;
  // sortDirection: string;
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
  selection = new SelectionModel<DiscrepancyStatus>(true, []);

  /** In-line editing */
  editedElement: DiscrepancyStatus;
  editedElementPrev: DiscrepancyStatus;
  editedElementNext: DiscrepancyStatus;
  editedField: string;
  selectObject: DiscrepancyStatus;

  constructor(private service: SettingService,
    private authService: AuthService) { }

  ngOnInit() {
    this.onStateInit();
  }

  getOptions(type: string) {
    return this.service.getOptions(type);
  }

  onStateInit() {
    // this.sortedData = this.dataSource;
    // this.pagedData = this.dataSource;
    // this.count = this.dateSourcePaged ? this.dateSourcePaged.count : 0;
    // this.pageIndex = 0;
    // this.pageSize = 25;
    this.pageSizeOptions = [20, 25, 30];

    if (!this.isAuthorized('update')) {
      this.displayedColumns.shift();
    }
  }

  /** @Output */
  onMemebrSelect(row) {
    this.selection.toggle(row);
    this.discrepnacyStatusSelected.emit(this.selection);
  }

  /** @Output */
  masterToggle() {

    this.isAllSelected() ?
      this.selection.clear() :
      this.pagedData.forEach(row => {
        if (row.discrepancyStatusType === 1)
          this.selection.select(row)
      });

    // this.memberListService.selectMember(this.selection.selected, this.pagedData.length);
    this.discrepnacyStatusSelected.emit(this.selection);
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.pagedData.filter(row => row.discrepancyStatusType === 1).length;
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

  onItemToggleClick(element: DiscrepancyStatus, field: string): void {
    // Disable Edit when discrepancyStatusType is System
    if (element.discrepancyStatusType === 0 || !this.isAuthorized('update'))
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

