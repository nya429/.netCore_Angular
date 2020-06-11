import { ReportService } from './../../report/report.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { MemberService } from 'src/app/member/member.service';
import { PagedList } from 'src/app/model/response.model';
import { ReportProductivity } from 'src/app/model/report.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  public actionUserId;

  constructor(
    private authService: AuthService,
    private memberService: MemberService,
    private reportService: ReportService
  ) {
    this.actionUserId = this.authService.getActionUserId();
  }

  ngOnInit(): void {

  }
  ngOnDestroy(): void {

  }


}
