import { ReportProductivityDetailGroup } from './../../model/report.model';
import { UserOption } from 'src/app/model/user.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { ReportService } from '../report.service';
import { SettingService } from 'src/app/setting/setting.service';
import { Sort } from '@angular/material';

import { deepIsEqual } from './../../util/deepIsEqual';
import { ReportProductivity, ReportProductivityGroup } from 'src/app/model/report.model';
import { PagedList, ResponseList, Response } from '../../model/response.model'

@Component({
  selector: 'app-report-productivity',
  templateUrl: './report-productivity.component.html',
  styleUrls: ['./report-productivity.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ReportProductivityComponent implements OnInit, OnDestroy {
  private reportProductivityListReady$: Subscription;
  private reportProductivityDetailReady$: Subscription;

  public displayedColumns: string[] = ['userName', /*'dateTime',*/ /*'countDiscrepancy',*/ 'countInFlow', 'countOutFlow', 'countOutStanding', 'countTriage'];

  public dataSource: ReportProductivityGroup[] = [];
  public dataSourceDetail: PagedList<ReportProductivity>;
  public defaultCheckPointType = { checkPointType: 'W' }

  public selectedUserID: number;
  public timeSpanFetched = {
    startDate: null,
    endDate: null
  };

  constructor(private service: ReportService,
    private settingService: SettingService) { }

  ngOnInit() {
    this.initData();
    this.initState();
  }


  ngOnDestroy() {
    if (this.reportProductivityListReady$)
      this.reportProductivityListReady$.unsubscribe();

    if (this.reportProductivityDetailReady$)
      this.reportProductivityDetailReady$.unsubscribe();
  }

  initData() {
    this.service.getReportProductivity({});
  }

  initState() {
    this.reportProductivityListReady$ = this.service.reportProductivityReady.subscribe((result: Response<ResponseList<ReportProductivityGroup>>) => {
      this.dataSource = result.data.list;
      if (this.dataSource.length > 0) {
        this.timeSpanFetched.endDate = this.dataSource[0].endDate.slice(0, 10);
        this.timeSpanFetched.startDate = this.dataSource[0].dateTime.slice(0, 10);
      }
      this.selectedUserID = null;
    });

    this.reportProductivityDetailReady$ = this.service.reportProductivityDetailReady.subscribe((result: Response<PagedList<ReportProductivity>>) => {
      this.dataSourceDetail = result.data;
      if (result.data.count === 0)
        return;

      var checkPointType: string = result.extra['checkPointType'];

      var detail: ReportProductivityDetailGroup = {
        list: [...this.dataSourceDetail.list],
        timeSpan: { ... this.timeSpanFetched },
        checkPointType: checkPointType
      };

      this.dataSource.find(d => d.userID === result.data.list[0].userID).detail = detail;
    });
  }

  retrieveFilters() {
    if (!localStorage.getItem('report_productivity'))
      return null;

    const params = JSON.parse(localStorage.getItem('report_productivity'));
    return params;
  }

  onSaveFilters() {
    let params = {

    };
    localStorage.setItem('report_productivity', JSON.stringify(params));

    // this.openSnackBar('Filters Saved', 'Dismiss');
  }

  getUserName(userID: number) {
    var user: UserOption = this.settingService.getOptions('assigned_User').find((u: UserOption) => u.userID === userID);

    return user.userNameAD;
  }

  onDateApplied(e) {
    console.log(e);
    // this.timeSpanFetched = e;
    this.service.getReportProductivity({ ...e })
  }

  onSort(e: Sort) {
    var sortBy = e.direction ? e.active : 'userName'
    var orderby = e.direction ? (e.direction === 'asc' ? 0 : 1) : null;
    this.dataSource = [...this.dataSource.sort((a: ReportProductivity, b: ReportProductivity) => {
      if (sortBy === 'userID') {
        var order = this.settingService.getOptions('assigned_User').find((u: UserOption) => u.userID === a.userID) > this.settingService.getOptions('assigned_User').find((u: UserOption) => u.userID === b.userID) ? 1 : -1;
      } else {
        var order = a[sortBy] > b[sortBy] ? 1 : -1;
      }

      return orderby ? -order : order;
    })];

    console.log(this.selectedUserID)
  }

  onProductivityClick(userID: number) {
    this.selectedUserID = this.selectedUserID === userID ? null : userID;

    if (!this.selectedUserID)
      return;

    var selected = this.dataSource.find(d => d.userID === this.selectedUserID)

    if (selected.detail && selected.detail.timeSpan && deepIsEqual(selected.detail.timeSpan, this.timeSpanFetched))
      return;

    this.service.getReportProductivityDetail(this.selectedUserID, { ...this.timeSpanFetched, ...this.defaultCheckPointType });

  }

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');

  onCheckPointTypeChanged(e) {
    console.log(e)
    this.service.getReportProductivityDetail(this.selectedUserID, { ...e })
  }

  onProductivityDetailPaged(e) {
    this.service.getReportProductivityDetail(this.selectedUserID, { ...e })
  }

}
