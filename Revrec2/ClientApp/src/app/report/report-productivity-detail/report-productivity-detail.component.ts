import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReportProductivity } from 'src/app/model/report.model';
import { ReportService } from '../report.service';
import { SettingService } from 'src/app/setting/setting.service';
import { Subscription } from 'rxjs';
import { Sort, MatButtonToggleGroup, MatButtonToggleChange, PageEvent } from '@angular/material';
import { PagedList } from 'src/app/model/response.model';

@Component({
  selector: 'app-report-productivity-detail',
  templateUrl: './report-productivity-detail.component.html',
  styleUrls: ['./report-productivity-detail.component.css']
})
export class ReportProductivityDetailComponent implements OnInit {
  // private operationalProductivityListReady$: Subscription;
  // private _selectedUserID: number;
  group: MatButtonToggleGroup;
  displayedColumns: string[] = [/*'userName',*/ 'dateTime', 'countInFlow', 'countOutFlow', 'countOutStanding', 'countTriage'];
  @Input() userID;
  @Input() TimeSpanApplied;
  @Input() isLoading: boolean = false;
  @Input('isSubList') isSubList: boolean;
  @Input() defaultCheckPointType: string;
  @Input() containerH: number;
  @Output() checkPointTypeChanged = new EventEmitter<any>();
  @Output() onPagedAndSorted = new EventEmitter<any>();

  @Input('dataSource')
  set dataSource(dataSource: PagedList<ReportProductivity>) {
    if (!dataSource || !dataSource.list.length || dataSource === this._dataSource || dataSource.list[0].userID !== this.userID)
      return;
    this._dataSource = dataSource;
    // console.log(this._dataSource)
    this.displayedDataSource = this._dataSource.list;
    this.pageState.count = this.dataSource.count;
    this.pageState.pageSize = this.dataSource.pageSize;
    this.pageState.pageIndex = this.dataSource.pageIndex;
    this.isLoading = false;
  };

  get dataSource(): PagedList<ReportProductivity> {
    return this._dataSource;
  }

  private _dataSource: PagedList<ReportProductivity>;
  public displayedDataSource: ReportProductivity[];

  public checkPointType: { checkPointType: string }

  public pageState = {
    count: 0,
    pageIndex: 0,
    pageSize: 25,
    sortBy: "",
    orderBy: 0
  };
  pageSizeOptions = [15, 25, 50]

  public timeSpanFetched = {
    startDate: '2020-05-01',
    endDate: '2020-06-01'
  };

  constructor(private service: ReportService,
    private settingService: SettingService) { }

  ngOnInit() {
    this.initData();
    this.initState();
    // console.log(this.defaultCheckPointType)
  }

  ngOnDestroy() {
    // if (this.operationalProductivityListReady$)
    //   this.operationalProductivityListReady$.unsubscribe();
  }

  initData() {
    // this.service.getReportProductivityDetail(1, {});
  }

  initState() {
    // this.operationalProductivityListReady$ = this.service.reportProductivityDetailReady.subscribe((list: ReportProductivity[]) => {
    //   this.dataSource = list;
    //   this.removePrevious();
    // });
  }


  onSort(e: Sort) {
    var sortBy = e.direction ? e.active : 'dateTime'
    var orderby = e.direction ? (e.direction === 'asc' ? 0 : 1) : null;
    this.displayedDataSource = this.displayedDataSource.sort((a: ReportProductivity, b: ReportProductivity) => {
      var order = a[sortBy] > b[sortBy] ? 1 : -1;
      return orderby ? -order : order;
    }).slice();
  }

  onCheckPointTypeChange(e: MatButtonToggleChange) {
    this.checkPointType = { checkPointType: e.value }
    this.checkPointTypeChanged.emit({ ...this.checkPointType, ... this.TimeSpanApplied })
    this.isLoading = true;
  }

  onPage(e: PageEvent): void {
    // console.log(e, this.pageState);
    this.pageState.pageIndex = e.pageIndex;
    this.pageState.pageSize = e.pageSize;
    this.onPagedAndSorted.emit({ ...this.pageState, ...this.checkPointType, ... this.TimeSpanApplied });
    this.isLoading = true;
  }
}
