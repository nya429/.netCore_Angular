import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-report-productivity-container',
  templateUrl: './report-productivity-container.component.html',
  styleUrls: ['./report-productivity-container.component.css']
})
export class ReportProductivityContainerComponent implements OnInit {
  @Input() hideTitle: boolean = true;

  constructor() { }

  ngOnInit() {
  }

}
