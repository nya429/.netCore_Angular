import { ReportService } from './../report.service';
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-report-container',
  templateUrl: './report-container.component.html',
  styleUrls: ['./report-container.component.css']
})
export class ReportContainerComponent implements OnInit {
  links = [{ segment: 'gdp', description: 'Revrec 1.0 Story' },
  { segment: 'operational', description: 'Operatioanal' },
  { segment: 'financial', description: 'Financial' },
  { segment: 'productivity', description: 'Productivity' }
];
  

  /** @input */
  activeLink = this.links[0].segment;


  constructor(private router: Router,
    private route: ActivatedRoute,
    private service: ReportService) { }

  ngOnInit() {
  }

  onNavigate(link) {
    this.activeLink = link;
  }

  
  @HostListener('window:resize')
  onresize() {
    console.log('ONRESIZE')
    this.service.onWindowResize();
  }
}