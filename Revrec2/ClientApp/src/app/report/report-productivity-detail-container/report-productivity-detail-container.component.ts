import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { MemberService } from 'src/app/member/member.service';
import { ReportService } from '../report.service';
import { ReportProductivity, ReportProductivityDetailGroup } from 'src/app/model/report.model';
import { Subscription } from 'rxjs';
import { PagedList, ResponseList, Response } from '../../model/response.model'
@Component({
  selector: 'app-report-productivity-detail-container',
  templateUrl: './report-productivity-detail-container.component.html',
  styleUrls: ['./report-productivity-detail-container.component.css']
})
export class ReportProductivityDetailContainerComponent implements OnInit, OnDestroy {
  @Input() userID;
  @Input() containerH = 500;

  private reportProductivityDetailReady$: Subscription;

  public isLoading: boolean = false;
  public dataSourceDetail: PagedList<ReportProductivity>;
  public timeSpanFetched = {
    startDate: null,
    endDate: null
  };
  public defaultCheckPointType = { checkPointType: null }

  constructor(
    private service: ReportService
  ) { }

  ngOnInit() {
    this.initData();
    this.initState();
  }

  ngOnDestroy() {
    if (this.reportProductivityDetailReady$)
      this.reportProductivityDetailReady$.unsubscribe();
  }


  initData() {
    this.service.getReportProductivityDetail(this.userID, { ...this.timeSpanFetched, ...this.defaultCheckPointType });
  }



  initState() {
    this.reportProductivityDetailReady$ = this.service.reportProductivityDetailReady.subscribe((result: Response<PagedList<ReportProductivity>>) => {
      this.dataSourceDetail = result.data;
      var checkPointType: string = result.extra['checkPointType'];
      if (result.data.count === 0)
        return;
      if (!this.timeSpanFetched.endDate && !this.timeSpanFetched.startDate) {
        this.timeSpanFetched.endDate = this.dataSourceDetail.list[0].endDate.slice(0, 10);
        this.timeSpanFetched.startDate = this.dataSourceDetail.list[0].dateTime.slice(0, 10);
      }

      var detail: ReportProductivityDetailGroup = {
        list: [...this.dataSourceDetail.list],
        timeSpan: { ... this.timeSpanFetched },
        checkPointType: checkPointType
      };
    });
  }

  onCheckPointTypeChanged(e) {
    this.service.getReportProductivityDetail(this.userID, { ...e })
  }

  onProductivityDetailPaged(e) {
    this.service.getReportProductivityDetail(this.userID, { ...e })
  }

  onDateApplied(e) {
    this.timeSpanFetched = e
    this.service.getReportProductivityDetail(this.userID, { ...e })
  }
}

