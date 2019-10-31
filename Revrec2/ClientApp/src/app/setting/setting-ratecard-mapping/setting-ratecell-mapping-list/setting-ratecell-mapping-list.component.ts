import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

import { MatSnackBar, PageEvent, Sort } from '@angular/material';
import { SettingService } from '../../setting.service';


import {deepIsEqual} from './../../../util/deepIsEqual';
import { RateCellMap, CCARateCell } from 'src/app/model/setting.model';
import { PagedList } from 'src/app/model/response.model';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-setting-ratecell-mapping-list',
  templateUrl: './setting-ratecell-mapping-list.component.html',
  styleUrls: ['./setting-ratecell-mapping-list.component.css']
})
export class SettingRatecellMappingListComponent implements OnInit {
  displayedColumns: string[] = ['mmisProduct','mmisRateCell', 'ccaRateCell', 'activeFlag'];
  
  // @Input('source') dataSource: RateCellMappingMOCK[];
  @Output() onPagedAndSorted = new EventEmitter<any>();
  @Output() onUpdated = new EventEmitter<RateCellMap[]>();

  private _dateSourcePaged: PagedList<RateCellMap>;

  @Input('updatePermissionsRatecell') updatePermissions;
  
  @Input('sourcePaged')
  set dateSourcePaged(dateSourcePaged: PagedList<RateCellMap>) {
    this._dateSourcePaged = dateSourcePaged;
    this.pagedData = [...this._dateSourcePaged.list];
    this.pageState.count = this.dateSourcePaged.count;
    this.pageState.pageSize = this.dateSourcePaged.pageSize;
    this.pageState.pageIndex = this.dateSourcePaged.pageIndex;
  } ;

  get dateSourcePaged(): PagedList<RateCellMap> {
    return this._dateSourcePaged;
  }


  /** Table Source State: @Input */
  pagedData: RateCellMap[];

  // ccaRateCellEdit: CCARateCell;
  // ccaRateCellOptions: CCARateCell[] = [];
  
      /** 
     *  @PaginationState 
     *  data.Source.lenth will be used only for the first time
     *  pageIndex
     *  pageSize
   *  sortCloumn
   *  sortDirection
   *  pageSizeOptions
   */
  pageSizeOptions: number[] ;
  
  pageState = {
    count: 0,
    pageIndex: 0,
    pageSize: 25,
    sortBy: "",
    orderBy: 0
   }

  /** In-line editing */
  editedElement: RateCellMap;
  editedElementPrev: RateCellMap;
  editedElementNext: RateCellMap;
  editedField: string;
  selectObject: CCARateCell;
  
  constructor(
    private _snackBar: MatSnackBar,
    private service: SettingService,
    private authService: AuthService
  ) { }
  
  ngOnInit() {
    this.onStateInit();
  }

  onStateInit() {
    this.pageSizeOptions = [20, 25, 30];
  }

  getOptions(product: string): CCARateCell[] {
    return this.service.getOptions('rateCell', product)
  }

  onMappingItemFieldClicked(element: RateCellMap, field: string): void {
    if(this.editedField == null &&  this.editedField == null) {
      this.editedField = field;
      this.editedElement = element;
      this.editedElementPrev = { ...this.editedElement };
      this.editedElementNext = { ...this.editedElement };
    } else {
      this.onEditDismiss('update')
    }
  }
  
  onEditDismiss(type?: string) {
    if(!deepIsEqual(this.editedElement, this.editedElementPrev)) {
      this.editedElementNext.ccaRateCellID = this.selectObject.ccaRateCellID;
      this.editedElementNext.ccaRateCell = this.selectObject.ccaRateCell;
      this.editedElement.ccaRateCell = this.selectObject.ccaRateCell;
      this.onUpdated.emit([this.editedElementNext, this.editedElementPrev])
    } else {
      if(type === "update") {
        this.openSnackBar("Nothing Changed", "Dismiss")
      }
    }


    this.editedElement = null; 
    this.editedField = null;
    this.selectObject = null;
    this.editedElementNext = null;
    this.editedElementPrev = null;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1500,
    });
  }

  onPage(e : PageEvent): void {
    this.pageState.pageIndex = e.pageIndex;
    this.pageState.pageSize = e.pageSize;
    this.onPagedAndSorted.emit(this.pageState);
  }

  onSort(e: Sort): void {
    this.pageState.sortBy = e.direction ? e.active : null;
    this.pageState.orderBy = e.direction ? (e.direction === 'asc' ? 0 : 1) : null;
    this.pageState.pageIndex =  0;
    this.onPagedAndSorted.emit(this.pageState);
  }

  update() {

  }

  onSelect(e) {
    this.selectObject = e;
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
