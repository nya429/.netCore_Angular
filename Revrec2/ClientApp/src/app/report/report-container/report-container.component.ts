import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-report-container',
  templateUrl: './report-container.component.html',
  styleUrls: ['./report-container.component.css']
})
export class ReportContainerComponent implements OnInit {
  links = [{ segment: 'gdp', description: 'Revrec 1.0 Story' }];

  /** @input */
  activeLink = this.links[0].segment;


  constructor(private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
  }

  onNavigate(link) {
    this.activeLink = link;
  }
}