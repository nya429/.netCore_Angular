import { ReportOperationalDetail } from './../../model/report.model';
import { ReportService } from './../report.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Sort } from '@angular/material';
import { DataSource } from '@angular/cdk/table';

@Component({
  selector: 'app-report-operational-detail',
  templateUrl: './report-operational-detail.component.html',
  styleUrls: ['./report-operational-detail.component.css']
})
export class ReportOperationalDetailComponent implements OnInit, OnDestroy {
  private operationalReportDetailReady$: Subscription;
  displayedColumns: string[] = ['discrepancyStatus', 'varianceCount', 'varianceSum'];
  dataSource: ReportOperationalDetail[] = [];
  displayedDataSource: ReportOperationalDetail[];
  constructor(private service: ReportService) { }

  ngOnInit() {
    this.operationalReportDetailReady$ = this.service.reportOperationalDetailReady.subscribe((list: ReportOperationalDetail[]) => {
      this.dataSource = list;
      this.displayedDataSource = this.dataSource.filter((r: ReportOperationalDetail) => r.varianceCount != 0 || r.varianceSum != 0);
    })

  }

  ngOnDestroy() {
    if (this.operationalReportDetailReady$)
      this.operationalReportDetailReady$.unsubscribe();
  }

  getTotalSum() {
    if (!this.displayedDataSource.length)
      return 0;
    return this.displayedDataSource.map((d: ReportOperationalDetail) => d.varianceSum).reduce((acc, cur) => this.service.numberadd(acc, cur));
  }

  getTotalCount() {
    if (!this.displayedDataSource.length)
      return 0;
    return this.displayedDataSource.map((d: ReportOperationalDetail) => d.varianceCount).reduce((acc, cur) => acc + cur);
  }

  onSort(e: Sort) {
    var sortBy = e.direction ? e.active : 'discrepancyStatusID'
    var orderby = e.direction ? (e.direction === 'asc' ? 0 : 1) : null;
    this.displayedDataSource = this.displayedDataSource.sort((a: ReportOperationalDetail, b: ReportOperationalDetail) => {
      var order = a[sortBy] > b[sortBy] ? 1 : -1;
      return orderby ? -order : order;
    }).slice();
  }
}
