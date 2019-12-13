import { SharedService } from 'src/app/shared/shared.service';
import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Discrepancy } from 'src/app/model/discrepancy.model';
import { initTransferState } from '@angular/platform-browser/src/browser/transfer_state';

const MOCK_DATA = [
  { month: '2017-01-01T00:00:00', ccaRateCell: 'DC1', MH834_RateCell: 'DC1', MH834_LastAssessDate: '2017-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2017-02-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2017-03-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2017-04-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2017-05-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2017-06-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2017-07-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2017-08-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2017-09-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2017-10-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2017-11-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2017-12-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2018-01-01T00:00:00', ccaRateCell: 'DC1', MH834_RateCell: 'DC1', MH834_LastAssessDate: '2017-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2018-02-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2018-03-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2018-04-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2018-05-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2018-06-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2018-07-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2018-08-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2018-09-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2018-10-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2018-11-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2018-12-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2019-01-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2019-02-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DC1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2019-03-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DC1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2019-04-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DC1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2019-05-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DC1', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2019-06-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DC3', MH834_LastAssessDate: '2018-02-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2019-07-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2019-07-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2019-08-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2019-07-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2019-09-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2019-07-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2019-10-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2019-07-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
  { month: '2019-11-01T00:00:00', ccaRateCell: 'DF1', MH834_RateCell: 'DF1', MH834_LastAssessDate: '2019-07-01T00:00:00', GC_RateCell: 'DC1', GC_LastAssessDate: '2018-10-01T00:00:00' },
];

@Component({
  selector: 'app-discrepancy-detail-container',
  templateUrl: './discrepancy-detail-container.component.html',
  styleUrls: ['./discrepancy-detail-container.component.css'],
  animations: [
    trigger('container', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8%) scale(0.95)', }),
        animate("300ms ease-out", style({ opacity: 1, transform: 'translateY(0)  scale(1)', })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)', }),
        animate(200, style({ opacity: 0, transform: 'translateY(5%)', })),
      ]),
    ]),

    trigger('sub-container', [
      transition(':enter', [
        style({ opacity: 1, transform: 'translateX(100%)', }),
        animate("300ms ease-out", style({ opacity: 1, transform: 'translateX(0)', })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateX(0)', }),
        animate(200, style({ opacity: 1, transform: 'translateX(100%)', })),
      ]),
    ]),
  ],
})
export class DiscrepancyDetailContainerComponent implements OnInit {
  @ViewChild('host') hostView: ElementRef;
  @Output() onDismissed = new EventEmitter<void>();

  // Migth need object mod
  discrepancy: Discrepancy;

  displayedColumns: string[] = ['month', 'ccaRateCell', 'MH834_RateCell', 'GC_RateCell',];
  dataSource = MOCK_DATA;

  displayedColumns_hor: string[];
  dataSource_hor = [];


  contentHeight: number;
  contentWidth: number;

  isSideComponentContainerDisplay = false;
 
  displayTypes = ['MP', 'MH834', 'GC'];
  displayType;

  links = ["comment", "history"];
  /** @input */
  activeLink = this.links[0];

  constructor(private service: SharedService) {

  }

  ngOnInit() {
    this.initSource();
    this.initState();
   

  }

  ngDoCheck() {
    // get sub-list height at every tick  
    this.contentHeight = this.hostView.nativeElement.offsetHeight;
    this.contentWidth = this.hostView.nativeElement.offsetHeight;
  }

  initState() {
    this.isSideComponentContainerDisplay = true;

    this.displayedColumns_hor = this.dataSource.map(d => d.month);
    this.displayedColumns_hor.unshift('Source');

    const sources = ['ccaRateCell', 'MH834_RateCell', 'GC_RateCell'];

    sources.map(source => {
      let row = {};
      row['Source'] = source;

      this.dataSource.forEach(e => {
        row[e['month']] = e[source];
      });
      this.dataSource_hor.push(row);
    });

    console.log(this.dataSource_hor)
    console.log(this.discrepancy)
  }

  initSource() {
    this.getDiscrepancy();
  }

  onDismissClick() {
    this.onDismissed.emit();
  }

  toggleSideComponent() {
    this.isSideComponentContainerDisplay = ! this.isSideComponentContainerDisplay;

  }

  toggleChange1(event) {
    console.log(event.source)
    let toggle = event.source;
    if (toggle) {
      let group = toggle.buttonToggleGroup;
      if (event.value.some(item => item == toggle.value)) {
        group.value = [toggle.value];
        this.displayType = toggle.value;
      }
    } else {
      this.displayType = []
    }
  }

  isOutDate(value, month) {
    const MDS_EFFECTIVE_PERIOD = 12;

    const mds: Date = new Date(Date.parse(value));
    const current = new Date(Date.parse(month));
    const yearDiff = current.getFullYear() - mds.getFullYear();
    const monthDiff = current.getMonth() - mds.getMonth();
    const dateDiff = current.getDate() - mds.getDate();

    let condition = (monthDiff + yearDiff * 12) >= MDS_EFFECTIVE_PERIOD;
    return condition;
  }

  isWithinMonth(value, month) {
    const MDS_EFFECTIVE_PERIOD = 12;

    const mds: Date = new Date(Date.parse(value));
    const current = new Date(Date.parse(month));
    const yearDiff = current.getFullYear() - mds.getFullYear();
    const monthDiff = current.getMonth() - mds.getMonth();

    let condition = monthDiff === 0 && yearDiff === 0;
    return condition ? value : '';
  }

  formatMonth(month) {
    let date = new Date(Date.parse(month));
    return date.toLocaleDateString('default', { month: 'short', year: 'numeric' });
  }

  isCloumnReconciled(month, index) {
    const column = this.dataSource.filter(d =>
      d.month === month)[0];

    let condition = false;
    switch (this.displayType) {
      case "MP":
        if (index === 1) {
          condition = column.MH834_RateCell != column.ccaRateCell;
        } else if (index === 2) {
          condition = column.GC_RateCell != column.ccaRateCell;
        }
        break;
      case "MH834":
        if (index === 0) {
          condition = column.MH834_RateCell != column.ccaRateCell;
        } else if (index === 2) {
          condition = column.MH834_RateCell != column.GC_RateCell;
        }
        break;
      case "GC":
        if (index === 0) {
          condition = column.GC_RateCell != column.ccaRateCell;
        } else if (index === 1) {
          condition = column.GC_RateCell != column.MH834_RateCell;
        }
        break;
    }

    return !!column && condition;
  }

  getDiscrepancy() {
    this.discrepancy = this.service.getDisplayedDiscrepancy();

    if (this.discrepancy)
      return;

    this.service.getDiscrepancyById(this.discrepancy.discrepancyID).subscribe(result => {
      if (result.isSuccess) {
        console.log("get Comment Discrepancy", result.data)
        this.discrepancy = result.data;
      }
    }, error => {
      console.error(error);
    });
  }

  onNavigate(link) {
    this.activeLink = link;
  }
}
