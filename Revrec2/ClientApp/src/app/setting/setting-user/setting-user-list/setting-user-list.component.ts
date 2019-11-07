import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserMock } from '../setting-user.component';
import { SelectionModel } from '@angular/cdk/collections';
import { User } from 'src/app/model/user.model';
import { PagedList } from 'src/app/model/response.model';
import { PageEvent, Sort } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-setting-user-list',
  templateUrl: './setting-user-list.component.html',
  styleUrls: ['./setting-user-list.component.css']
})
export class SettingUserListComponent implements OnInit {

  @Input('updatePermissions') updatePermissions;

  private _dateSourcePaged: PagedList<User>;
  @Input('sourcePaged')
  set dateSourcePaged(dateSourcePaged: PagedList<User>) {
    this._dateSourcePaged = dateSourcePaged;
    this.pagedData = [...this._dateSourcePaged.list];
    this.pageState.count = this.dateSourcePaged.count;
    this.pageState.pageSize = this.dateSourcePaged.pageSize;
    this.pageState.pageIndex = this.dateSourcePaged.pageIndex;
  };

  get dateSourcePaged(): PagedList<User> {
    return this._dateSourcePaged;
  }

  // @Output() userSelected = new EventEmitter<SelectionModel<User>>();
  @Output() onPagedAndSorted = new EventEmitter<any>();
  @Output() onUpdated = new EventEmitter<User[]>();


  displayedColumns: string[] = ['name', 'email', 'role'];

  /** Table Source State: @Input */
  sortedData: UserMock[];

  pagedData: User[];

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
  selection = new SelectionModel<User>(true, []);

  /** In-line editing */
  editedElement: User;
  editedElementPrev: User;
  editedElementNext: User;
  editedField: string;
  selectObject: User;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.onStateInit();
  }

  onStateInit() {
    // this.sortedData = this.dataSource;
    // this.pagedData = this.dataSource;
    // this.count = this.dataSource.length;
    // this.pageIndex = 0;
    // this.pageSize = 25;
    this.pageSizeOptions = [20, 25, 30];
  }

  /** @Output */
  onMemebrSelect(row) {
    this.selection.toggle(row);
    //Output
    // this.userSelected.emit(this.selection);
  }

  /** @Output */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.pagedData.forEach(row => this.selection.select(row));
    //Output
    // this.userSelected.emit(this.selection);
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


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.pagedData.length;
    return numSelected == numRows;
  }

  onItemToggleClick(element: User, field: string): void {
    this.editedField = field;
    this.editedElement = element;
    this.editedElementPrev = { ...this.editedElement };
    this.editedElementNext = { ...this.editedElement };
    this.editedElementNext[this.editedField] = !this.editedElementPrev[this.editedField];
    // console.log(element, this.editedElementPrev, this.editedElementNext)
    this.onUpdated.emit([this.editedElementNext, this.editedElementPrev])
  }

  onItemCheckBoxClick(element: User, field: string): void {
    this.editedField = field;
    this.editedElement = element;
    this.editedElementPrev = { ...this.editedElement };
    this.editedElementNext = { ...this.editedElement };
    this.editedElementNext[this.editedField] = !this.editedElementPrev[this.editedField];
    // console.log(element, this.editedElementPrev, this.editedElementNext)
    this.onUpdated.emit([this.editedElementNext, this.editedElementPrev])
  }

  isAuthorized(view: string, updatePermissions: string, element: User) {
    switch (view) {
      case "update":
        return this.isCurrentUser(element) || this.authService.isViewAuthorized(updatePermissions);
      default:
        return false;
    }
  }

  isCurrentUser(element: User) {
    return element.userID === this.authService.actionUser.userID;
  } 
}
