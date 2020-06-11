import { ReportService } from './../report.service';
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Link } from 'src/app/auth/auth.endpoint';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-report-container',
  templateUrl: './report-container.component.html',
  styleUrls: ['./report-container.component.css']
})
export class ReportContainerComponent implements OnInit {
  links: Link[] = [] as Link[];
  
  /** @input */
  activeLink: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private appSerivce: AppService,
    private service: ReportService) { 
      this.links = this.appSerivce.getReportLinks();
      this.activeLink = this.router.url.substring(9);
    }

  ngOnInit() { }

  onNavigate(link: string) {
    this.activeLink = link;
  }
  
  @HostListener('window:resize')
  onresize() {
    console.log('ONRESIZE')
    this.service.onWindowResize();
  }
}