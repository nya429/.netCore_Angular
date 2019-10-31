import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { RegionMappingMOCK } from '../setting-ratecard-mapping.component';
import { SettingService } from '../../setting.service';
import { MatSnackBar, PageEvent, Sort } from '@angular/material';
import { registerContentQuery } from '@angular/core/src/render3/instructions';

import {deepIsEqual} from './../../../util/deepIsEqual';
import { RegionMap, CCARegion } from 'src/app/model/setting.model';
import { PagedList } from 'src/app/model/response.model';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-setting-region-mapping-list',
  templateUrl: './setting-region-mapping-list.component.html',
  styleUrls: ['./setting-region-mapping-list.component.css']
})
export class SettingRegionMappingListComponent implements OnInit {
  displayedColumns: string[] = ['mmisProduct', 'mmisRegion', 'ccaRegion', 'activeFlag'];
 
  // @Input('source') dataSource: RegionMappingMOCK[];
  @Output() onPagedAndSorted = new EventEmitter<any>();
  @Output() onUpdated = new EventEmitter<RegionMap[]>();

  private _dateSourcePaged: PagedList<RegionMap>;

  @Input('updatePermissionsRegion') updatePermissions;

  @Input('sourcePaged')
  set dateSourcePaged(dateSourcePaged: PagedList<RegionMap>) {
    this._dateSourcePaged = dateSourcePaged;
    this.pagedData = [...this._dateSourcePaged.list];
    this.pageState.count = this.dateSourcePaged.count;
    this.pageState.pageSize = this.dateSourcePaged.pageSize;
    this.pageState.pageIndex = this.dateSourcePaged.pageIndex;
  } ;

  get dateSourcePaged(): PagedList<RegionMap> {
    return this._dateSourcePaged;
  }
  /** Table Source State: @Input */

  pagedData: RegionMap[];

  ccaRegionEdit: CCARegion;
  ccaRegionOptions: CCARegion[];

  /** 
 *  @PaginationState 
 *  data.Source.lenth will be used only for the first time
 *  pageIndex
 *  pageSize
*  sortCloumn
*  sortDirection
*  pageSizeOptions
*/

  pageState = {
    count: 0,
    pageIndex: 0,
    pageSize: 20,
    sortBy: "",
    orderBy: 0
  }

  pageSizeOptions: number[];

  /** In-line editing */
  editedElement: RegionMap;
  editedElementPrev: RegionMap;
  editedElementNext: RegionMap;
  editedField: string;
  selectObject: CCARegion;

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
    this.ccaRegionOptions = this.service.getOptions('region');
  }

  getOptions(product: string): any[] {
    return this.service.getOptions('region', product);
  }

  onMappingItemFieldClicked(element: RegionMap, field: string): void {
    if(this.editedField == null &&  this.editedElement == null) {
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
      this.editedElementNext.ccaRegionID = this.selectObject.ccaRegionID;
      this.editedElementNext.ccaRegion = this.selectObject.ccaRegion;
      this.editedElement.ccaRegion = this.selectObject.ccaRegion;
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

  onUpdate() {

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
