import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
declare var tableau: any;

@Component({
  selector: 'app-tableau-container',
  templateUrl: './tableau-container.component.html',
  styleUrls: ['./tableau-container.component.css']
})
export class TableauContainerComponent implements OnInit {
  @ViewChild("vizContainer") containerDiv: ElementRef;
  public viz: any;

  constructor() { }

  ngOnInit() {

    // Replace this url with the url of your Tableau dashboard

    // Creating a viz object and embed it in the container div.
    this.initTableau();
  }

  initTableau() {
    const url = 'https://tableauprod01.commonwealthcare.org/t/BusinessPublishing/views/DiscrepancyReportingRevRec1_0/RevRec1_0?:embed=yes';
    const options = {
      hideTabs: true,
      onFirstInteractive: () => {
        // console.log("onFirstInteractive");
      },
      onFirstVizSizeKnown: () => {
        // console.log("onFirstVizSizeKnown");
      }
    };

    this.viz = new tableau.Viz(this.containerDiv.nativeElement, url, options);
  }

}