import { ExploreRateCell } from './../../model/explore.model';
import { Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Renderer2, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Discrepancy } from 'src/app/model/discrepancy.model';
import { initTransferState } from '@angular/platform-browser/src/browser/transfer_state';
import { SharedService } from 'src/app/shared/shared.service';
import { ErrorService } from 'src/app/error.service';
import { fn } from '@angular/compiler/src/output/output_ast';
import { FormGroup, FormBuilder } from '@angular/forms';

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
export class DiscrepancyDetailContainerComponent implements OnInit, OnDestroy {
  @ViewChild('host') hostView: ElementRef;
  // @ViewChild('tableTooltip') tooltip: ElementRef;

  @Output() onDismissed = new EventEmitter<void>();

  // Migth need object mod
  discrepancy: Discrepancy;

  exploreRateCellListChanged$: Subscription;

  /** Side Component State */
  isSideComponentContainerDisplay = false;
  links = ["comment"];
  /** @input */
  activeLink = this.links[0];
  sideComponentHeight: number;
  sideComponentWidth: number;


  /** Comparison State */
  discrepancyType = ['RC', 'RE', 'PP', 'SP'];
  displayedDiscrepancyType = this.discrepancyType[0];

  /** search from */
  searchForm: FormGroup;


  /** Comparison State */
  sourceSystems = {
    mP: 'Market Prominence',
    mH834: 'Mass Health 834',
    cmP: 'Guiding Care',
  };
  displayedColumns: string[] = ['month', 'cca_RateCell', 'MH834_RateCell', 'GC_RateCell'];
  dataSource: ExploreRateCell[];

  displayedColumns_hor: string[];
  dataSource_hor = [];

  displayTypes = ['mP', 'mH834', 'cmP'];
  displayType = this.displayTypes[0];

  // timespan = {
  //   cca: [] as { ratecell: string, start: string, end: string }[],
  //   MH834: [] as { ratecell: string, start: string, end: string }[],
  //   GC: [] as { ratecell: string, start: string, end: string }[],
  // };

  timespan = {
    mP: [] as { ratecell: string, start: string, end: string }[],
    mH834: [] as { ratecell: string, start: string, end: string }[],
    cmP: [] as { ratecell: string, start: string, end: string }[],
  };

  constructor(private service: SharedService,
    private errorService: ErrorService,
    private fb: FormBuilder
    // private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.initForm();
    this.initState();
  }

  ngDoCheck() {
    /** get sub-list height at every tick  */
    this.sideComponentHeight = this.hostView.nativeElement.offsetHeight;
    // this.sideComponentWidth = this.hostView.nativeElement.offsetHeight;
  }

  ngOnDestroy() {
    this.exploreRateCellListChanged$.unsubscribe();
  }

  initState() {
    this.isSideComponentContainerDisplay = false;

    this.exploreRateCellListChanged$ = this.service.exploreRateCellListChanged.subscribe((exploreRateCellList: ExploreRateCell[]) => {
      console.log(exploreRateCellList)
      this.dataSource = []

      let idDuplicated = false;


      // Temprary Solution for Duplicate Member Month
      exploreRateCellList.forEach((e: ExploreRateCell) => {
        const month = e.memberMonth;
        if (this.dataSource.find((d: ExploreRateCell) => d.memberMonth === month)) {
          this.dataSource
            .filter((d: ExploreRateCell) => d.memberMonth === month)
            .forEach((d: ExploreRateCell) => {
              if (Date.parse(d.mh834_LastAssessedDate) < Date.parse(e.mh834_LastAssessedDate)) {
                this.dataSource.pop();
                this.dataSource.push(e);
              }
            })
          idDuplicated = true;
        }
        // Temprary Solution for Missing Member Month
        else {
          this.dataSource.push(e);
        }
      })

      if (idDuplicated) {
        this.errorService.sendCustomizedError(["Duplicated Month"])
      }

      setTimeout(() => {
        this.getSpan();
        this.turnSourceHorizantal();
      }, 400);
    })

    this.initSource();
  }

  initForm() {
    this.searchForm = this.fb.group({
      startDate: '',
      endDate: '',
    }, {
        validator: this.dateInputValidator
      });
  }

  turnSourceHorizantal() {
    // this.displayedColumns_hor = this.dataSource.map(d => d.month);
    this.displayedColumns_hor = this.dataSource.map(d => d.memberMonth);
    this.displayedColumns_hor.unshift('Source');

    // const sources = ['cca', 'MH834', 'GC'];
    const sources = ['mP', 'mH834', 'cmP'];

    sources.map(source => {
      let sourceRow = {};
      sourceRow['Source'] = source;
      sources.filter
      // this.dataSource.forEach(monthRow => {
      this.dataSource.forEach((monthRow: ExploreRateCell) => {
        let isStart = !!this.timespan[source].find(span => Date.parse(span.start) == Date.parse(monthRow.memberMonth));
        let isEnd = !!this.timespan[source].find(span => Date.parse(span.end) == Date.parse(monthRow.memberMonth));

        sourceRow[monthRow.memberMonth] = {
          RateCell: monthRow[source + '_RateCell'] ? monthRow[source + '_RateCell'] : '99'
          , LastAssessedDate: monthRow[source + "_LastAssessedDate"]
          , isStart: isStart
          , isEnd: isEnd
          , source: source
        };

        sources
          .filter(sor => sor !== source)
          .forEach(sourceB => {
            const cloumName = `match_${source.toUpperCase()}To${sourceB.toUpperCase()}`;
            sourceRow[monthRow.memberMonth][cloumName] = monthRow[cloumName] == "1"
          })
      });
      this.dataSource_hor.push(sourceRow);
    });

    console.log(this.dataSource_hor)
  }

  getSpan() {
    // const sources = ['cca', 'MH834', 'GC'];
    const sources = ['mP', 'mH834', 'cmP'];

    this.dataSource.forEach((monthRow: ExploreRateCell, index) => {
      // const month = monthRow.month
      const month = monthRow.memberMonth

      sources.map(source => {
        const sourceRateCell = monthRow[source + '_RateCell'] ? monthRow[source + '_RateCell'] : '99';
        let next = false;
        if (this.timespan[source].length === 0) {
          this.timespan[source].push({ ratecell: sourceRateCell, start: month, end: '' })
          next = true;
        }

        if (!next) {
          let span = this.timespan[source][this.timespan[source].length - 1];

          if (span.ratecell != sourceRateCell) {
            /** @TODO Year + 1
             *  "2019-09-01T00:00:00"
            */
            const MONTH = new Date(Date.parse(month));
            const OFFSET = 1;
            let monAlt = MONTH.getMonth();
            let yearAlt = MONTH.getFullYear();
            if (monAlt === 11) {
              monAlt = + OFFSET
              yearAlt = MONTH.getFullYear() + OFFSET
            } else {
              // 0 Based Month
              monAlt = monAlt + OFFSET + 1
            }

            span.end = yearAlt.toString() + "-" + (monAlt < 10 ? "0" + monAlt : monAlt).toString() + "-01T00:00:00"

            this.timespan[source][this.timespan[source].length - 1] = span;
            this.timespan[source].push({ ratecell: sourceRateCell, start: month, end: '' });
          }
        }

        if (index === this.dataSource.length - 1) {
          let span = this.timespan[source][this.timespan[source].length - 1];
          span.end = month;
          this.timespan[source][this.timespan[source].length - 1] = span;
        }
      });
    });

    console.log(this.timespan)
  }

  getLastAssess(source) {
    if (source === 'mP') {
      return '';
    }
    return " Last Assessed on: " + this.formatMonth(this.dataSource[0][source + "_LastAssessedDate"]);
  }

  initSource() {
    this.getDiscrepancy();
    this.service.getRateCellCrossSourceListByDiscrepancyId(this.discrepancy.discrepancyID);
  }

  onDismissClick() {
    this.onDismissed.emit();
  }

  toggleSideComponent() {
    this.isSideComponentContainerDisplay = !this.isSideComponentContainerDisplay;
  }

  getSourceName(columnName) {
    return this.sourceSystems[columnName];
  }

  onSoureToggleClick(columnName) {
    if (columnName && this.displayType != columnName) {
      this.displayType = columnName;
    } else if (this.displayType === columnName) {
      this.displayType = null;
    }
  }

  toggleChange(event) {
    let toggle = event.source;
    if (toggle) {
      let group = toggle.buttonToggleGroup;
      if (event.value.some(item => item == toggle.value)) {
        group.value = [toggle.value];
        this.displayType = toggle.value;
      }
    } else {
      this.displayType = null;
    }
  }

  isWithinMDS(value, month) {
    const MDS_EFFECTIVE_PERIOD = 12;

    const mds: Date = new Date(Date.parse(value));
    const current = new Date(Date.parse(month));
    const yearDiff = current.getFullYear() - mds.getFullYear();
    const monthDiff = current.getMonth() - mds.getMonth();
    const dateDiff = current.getDate() - mds.getDate();

    let condition = (monthDiff + yearDiff * 12) < MDS_EFFECTIVE_PERIOD && (monthDiff + yearDiff * 12) >= 0;
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

  /**
   * @param month 
   * @param cell 
   * 
   */
  isCloumnReconciled(month, cell) {
    if (this.displayType === null) {
      return true;
    }

    const source = this.displayType.toUpperCase();
    const sourceBStr = cell['Source'].toUpperCase()

    let condition = false;
    condition = (source === sourceBStr) || (cell[month][`match_${sourceBStr.toUpperCase()}To${source.toUpperCase()}`])
    return condition;
  }

  getLastAssessDate() {

  }

  getRateCell(cell) {
    return cell['isStart'] ? cell['RateCell'] : '--'
  }

  getTooltip(cell) {
    return this.timespan[cell['source']]
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

  onDiscrepancyTypeCardClick(type: string) {
    this.displayedDiscrepancyType = type;
  }

  // onRateCellHover(e: MouseEvent, element) {
  //   this.renderer.setStyle(this.tooltip.nativeElement, "top", -16 + "px");
  //   this.renderer.setStyle(this.tooltip.nativeElement, "left", e.layerX + "px");
  // }

  dateInputValidator(form: FormGroup) {
    const condition = form.get('startDate').getError('matDatepickerParse') || form.get('endDate').getError('matDatepickerParse')
    return condition ? { dateInputError: true } : null;
  }

  fireWhenEmpty(el, formControlName: string): void {
    if (!el.value || el.value === '') {
      this.searchForm.patchValue({ [formControlName]: '' }, { emitEvent: true })
    }
  }
}
