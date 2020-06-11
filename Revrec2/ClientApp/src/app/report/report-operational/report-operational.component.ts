import { DiscrepancyStatusOption } from './../../model/setting.model';
import { Component, OnInit, ElementRef, ViewChild, Input, HostListener, OnDestroy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ReportOperational } from './../../model/report.model';
import { ReportService } from './../report.service';
import { transition } from '@angular/animations';
import * as d3 from 'd3';
import * as d3Chromatic from 'd3-scale-chromatic';
import { SettingService } from 'src/app/setting/setting.service';
import { SharedService } from 'src/app/shared/shared.service';
// import { appendFile } from 'fs';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';
import { NavigationService } from 'src/app/navigation/navigation.service';
import { Router } from '@angular/router';
const moment = _rollupMoment || _moment;

type MonthGrouped = { year: number, month: string[] };
@Component({
  selector: 'app-report-operational',
  templateUrl: './report-operational.component.html',
  styleUrls: ['./report-operational.component.css']
})
export class ReportOperationalComponent implements OnInit, OnDestroy {
  @ViewChild('BarChart') private chartContainer: ElementRef;
  // @ViewChild('Report') private reportContainer: ElementRef;

  @Input() private data: Array<any>;


  svg;
  element;
  element2;

  private windowResize$: Subscription;
  private reportChanged$: Subscription;

  reportData: ReportOperational[];
  filterdDataMock;
  monthStr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  /** @TODO   */
  private isFilterExists;

  private resizeTimer;
  private rawData;
  private stackedData;

  private margin: any = { top: 90, bottom: 20, left: 20, right: 20 };
  private padding = { left: 108, right: 36, top: 48, bottom: 144 };
  private rectHeight = 25;
  private rectPadding = 1;

  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private paddingScale: any;


  private maxGrouped;
  private maxStacked;
  private formatPercent = d3.format(".0%");
  private formatNumber = d3.format("");


  private colors: any;
  private xAxis: any;
  private yAxis: any;
  private yAxisLine: any;
  private rectBars: any;
  private legend: any;
  private tooltipSVG: any;
  private tooltipDiv: any;

  // public searchForm: FormGroup;
  public chartState = {
    xindex: [],
    sorted: false,
    /**  @TODO Should be configurble */
    schemaActive: 'Stacked',
    schemaOptions: ['Stacked', 'Percent', 'Grouped'],
    /**  @TODO keys shoudl be  */
    keys: [{ name: 'Member resolved', active: true },
    { name: 'Member unresolved', active: true },
    { name: 'Non-member resolved', active: true },
    { name: 'Non-member unresolved', active: true }],
    /**  @TODO Should be configurble */
    activeKeyCountPrev: 4,
    transitioning: false,
    tooltip: {
      tooltipDisplayed: true,
      /** svg tooltip needs  */
      tooltipH: 100,
      tooltipW: 200,
    },
    rectActive: {
      selected: null,
    },
    selectedDetail: {
      isSelected: false,
      month: '',
      isEnrolled: null,
      isResolved: null
    },
    timeSpanApplied: {
      startDate: null,
      endDate: null
    },
    timeSpanFetched: {
      startDate: null,
      endDate: null
    }
  }

  btns = [{
    Name: 'Export',
    Icon: 'export data',
    Description: "Download as CSV",
    onClick: (data) => this.onExportDiscrepancy(data),

  }, {
    Name: 'Redirect',
    Icon: 'export data',
    Description: "Download as CSV",
    onClick: (data) => this.onRedirectDiscrepancy(data),
  },
    // {
    //   Name: 'Detail',
    //   Icon: 'more',
    //   Description: "Download as CSV",
    //   onClick: (data) => this.getReportDetail(data),
    // }
  ];

  selectedBar;

  public months = [];
  // public monthtest = {};
  public monthGrouped = {};
  public objectKeys = Object.keys;
  public selection = new SelectionModel<string>(true, []);


  constructor(private fb: FormBuilder,
    private service: ReportService,
    private settingService: SettingService,
    private sharedService: SharedService,
    private navService: NavigationService,
    private router: Router) { }

  ngOnInit() {
    this.initData();
    this.initState();
    this.element = this.chartContainer.nativeElement;
  }

  ngOnDestroy() {
    if (this.windowResize$) {
      this.windowResize$.unsubscribe();
    }

    if (this.reportChanged$) {
      this.reportChanged$.unsubscribe();
    }
  }

  onResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.onRemoveEffect();
      this.clearChart();
      this.updateBase()
      this.updateScale();
      this.initLegend();

      /** @FIXME fix month binding when resize */
      this.initChart();
    }, 500)
  }

  groupMonths() {
    this.months = this.service.getMonths(this.reportData);
    if (this.months.length === 0)
      return;

    const sortedMonths = this.months.sort((a, b) => Date.parse(a) - Date.parse(b));


    const dateStart = sortedMonths[0];
    const startMonth = new Date(Date.parse(dateStart)).getUTCMonth() + 1;
    const startYear = new Date(Date.parse(dateStart)).getUTCFullYear();

    const dateEnd = sortedMonths[sortedMonths.length - 1];
    const endMonth = new Date(Date.parse(dateEnd)).getUTCMonth() + 1;
    const endYear = new Date(Date.parse(dateEnd)).getUTCFullYear();

    this.chartState.timeSpanFetched.startDate = dateStart;
    this.chartState.timeSpanFetched.endDate = dateEnd;

    this.monthGrouped = {} as MonthGrouped;
    for (let year = startYear; year <= endYear; year++) {
      var obj = { year: year, month: [] };
      this.monthGrouped[year] = []
      var _strMonth = year === startYear ? startMonth : 1;
      for (let month = _strMonth; month <= 12; month++) {
        if (year === endYear && month > endMonth) {
          break;
        } else if (year !== endYear || (year === endYear && month <= endYear)) {
          const mon = `${year}-${month > 9 ? month : "0" + month}-01`;
          // obj.month.push(mon);
          this.monthGrouped[year].push(mon)
        }
      }
    }

    console.log('DEBUT sortedMonths', this.monthGrouped);
  }

  updateBase() {
    this.width = this.element.offsetWidth - this.margin.left - this.margin.right;
    this.height = this.element.offsetHeight - this.margin.top - this.margin.bottom;


    this.width = this.width <= 0 ? 1024 : this.width;
    this.height = this.height <= 624 ? 624 : this.height;
    // console.log(element.clientWidth, element.clientHeight, element2.clientHeight)
    if (!this.svg) {
      this.svg = d3.select(this.element).append('svg')
    }
    this.svg
      .attr('width', this.width)
      .attr('height', this.height);
  }

  updateScale() {
    if (this.chartState.sorted) {
      this.chartState.xindex = d3.range(this.filterdDataMock.length).sort((a, b) => {
        var diff = d3.sum(this.chartState.keys.map(d => this.filterdDataMock[a][d.name]))
          - d3.sum(this.chartState.keys.map(d => this.filterdDataMock[b][d.name]))
        return diff
      });
    } else {
      this.chartState.xindex = d3.range(this.filterdDataMock.length)
    }
    // this.chartState.xindex = d3.range(this.filterdDataMock.length);

    // month related 
    this.xScale = d3.scaleBand()
      /** @FIXME fix month binding when resize */
      // .domain(d3.range(this.dataMock.length))
      .domain(this.chartState.xindex)
      .range([0, this.width - this.padding.left - this.padding.right]);

    //schema related
    this.yScale = d3.scaleLinear()
      // .domain([0, d3.max(this.dataMock.map(d => d.value))])
      .domain([0, this.maxStacked])
      .range([this.height - this.padding.bottom - this.padding.top, 0]);
  }

  initLegend() {
    var size = 16;
    var fontSize = 16;

    const data = this.chartState.keys.map(key => {
      return { name: key.name.split('_').slice(1).join(' '), active: key.active }
    })

    this.legend = this.svg.append('g')
      .attr("class", "g-legend")
      .attr('transform', (d, i) => {
        var len = data[0].name.length
        return `translate(${this.width - this.padding.right - len * fontSize / 2 - size}, ${0})`;
      })
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr("class", "legend")
      .attr("id", d => d.name)
      .attr('opacity', (d, i) => d.active ? 1 : 0)
      .attr('transform', (d, i) => {
        var len = data
          .filter((d, index) => i >= index && d.active && index > 0)
          .reduce((acc, cur) => acc + cur.name.length, 0);
        return `translate(${- len * fontSize * 0.6 - size * (i + 1.4)}, ${this.padding.top / 3})`;
      })

    this.legend
      .append('rect')
      .attr('width', d => `${size}`)
      .attr('height', `${size}`)
      .attr('fill', (d, i) => this.colors(i))

    this.legend
      .append('text')
      .text(d => d.name)
      .attr('alignment-baseline', 'hanging')
      .attr('x', 1.4 * size)
      .attr('fill', "#555")
      .attr('font-size', `${fontSize}`)
  }

  updateLegend() {
    var size = 16;
    var fontSize = 16;
    const data = this.chartState.keys.map(key => {
      return { name: key.name.split('_').slice(1).join(' '), active: key.active }
    })

    this.legend = this.svg
      .select('.g-legend')
      .selectAll(".legend")
      .data(data)
      .transition()
      .attr('opacity', (d, i) => d.active ? 1 : 0)
      .attr('transform', (d, i) => {
        var len = data
          .filter((d, index) => i >= index && d.active && index > 0)
          .reduce((acc, cur) => acc + cur.name.length, 0);
        return `translate(${- len * fontSize * 0.6 - size * (i + 1.4)}, ${this.padding.top / 3})`;
      })
  }

  initChart() {
    const self = this;
    //schema related
    this.yScale.domain([0, this.maxStacked]);

    this.paddingScale = d3.scaleLinear()
      .domain([0, 5])
      .range([0, this.xScale.bandwidth() / 2]);


    this.xAxis = d3.axisBottom(this.xScale)
      .tickFormat((d, i) =>
        // d3.timeFormat("%B %Y")(Date.parse(
        // this.dataMock[i].month
        this.selection.selected[i]
        // ))
      );

    this.yAxis = d3.axisLeft(this.yScale).tickArguments(this.formatNumber);

    this.yAxisLine = d3.axisRight(this.yScale)
      .tickSize(this.width - this.padding.left - this.padding.right)
      .tickFormat('')

    const x = this.svg.append('g')
      .attr('class', 'g-axis-x');

    x.append('g')
      .attr('class', 'axis-x')
      .attr('transform', `translate(${this.padding.left}, ${this.height - this.padding.bottom})`)
      .call(this.xAxis)


    x.selectAll('text') // `text` has already been created
      .style("text-anchor", "end")
      .style("font-size", "1.1em")
      .attr('dx', "-1em")
      .attr('dy', "-1em")
      .attr("transform", "rotate(-65)")
      .text((d, i) => this.monthStr[new Date(Date.parse(
        // this.dataMock[i].month
        this.selection.selected[i]
      )).getUTCMonth()])
      // .enter()
      .append('tspan')
      .attr('x', 0)
      .attr('dx', "-.5em")
      .attr('dy', '1.5em')
      .text((d, i) => new Date(Date.parse(
        // this.dataMock[i].month
        this.selection.selected[i]
      )).getUTCFullYear())

    x.append("text")
      // .attr("transform", "rotate(-90)")
      .attr("x", (this.width + this.padding.left - this.padding.right) / 2)
      .attr("y", this.height - this.padding.top)
      .attr('fill', "#555")
      .attr("dy", "-.75em")
      .style("text-anchor", "middle")
      .text("Month");

    const y = this.svg.append('g')
      .attr('class', 'g-axis-y')

    y.append('g')
      .attr('class', 'axis-y')
      .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`)
      // .style("font-size", "1.1em")
      .call(this.yAxis)
    // .select(".g-axis-y")

    y.append("text")
      .attr("x", - (this.height + this.padding.top - this.padding.bottom) / 2)
      .attr("y", this.padding.left)
      .attr("dy", "-3.5em")
      .attr('fill', "#555")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "middle")
      // .style("font-size", "1.4em")
      .text("Total Discrepancies")

    const line = this.svg.append('g')
      .attr('class', 'g-axis-y-line')
      .attr("stroke", "#777")
      .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`)
      .call(this.yAxisLine)
      .selectAll("line")
      .attr("stroke", "#777")

    this.rectBars = this.svg.append('g')
      .attr('class', 'g-test-data')
      .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`)
      .selectAll('g')
      .data(this.stackedData)
      .enter()
      .append('g')
      .attr('class', 'g-stack')
      .attr('fill', (d, i) => this.colors(i))
      // .attr('fill', 'red')
      .selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('id', (d, i) => `${d.key} ${d.data.month}`)
      .attr('d', d => d[3][d[2]])
      .attr('opacity', 1)

    // this.rectBars
    // .append('title')
    // .attr('d', (d, i) => {
    //   return d[3][d[2]];
    // })
    // .text((d, i) => {
    //   return `${d.key}\nCount: ${d[3][d[2]]} of ${d3.sum(d[3])} \nMonth: ${this.dataMock[i].month}`
    // })

    this.rectBars
      .attr('x', (d, i) => this.xScale(i) + this.paddingScale(this.rectPadding) / 2)
      .attr('y', d => this.yScale(0))
      .attr('width', this.xScale.bandwidth() - this.paddingScale(this.rectPadding))
      .attr('height', d => 0);

    this.updateChart();
    this.appendFilters();
    this.initToolTipDIV();
    this.appendEventListener();
  }

  appendEventListener() {
    this.rectBars
      .on('mouseover', (d, i, nodes) => {
        const node = nodes[i]
        if (this.chartState.transitioning) {
          return;
        }

        this.onRectMouseOver(node);
      })
      .on('mousemove', d => {
        if (this.chartState.transitioning || this.chartState.rectActive.selected) {
          return;
        }
        this.displayTooltipDIV(d)
      })
      .on('mouseout', (d, i, nodes) => {
        const node = nodes[i]
        if (this.chartState.transitioning) {
          return;
        }
        this.onRectMouseOut(node);

        if (!this.chartState.rectActive.selected) {
          this.hideTooltipDIV();
        }
      })
      .on('click', (d, i, nodes) => {
        console.log('rect click', d3.event, this.chartState.transitioning)

        d3.event.stopPropagation();

        const node = nodes[i]
        if (this.chartState.transitioning) {
          return;
        }
        this.onRectMouseClick(node)
        this.displayTooltipDIV(d)
      })

    if (this.tooltipDiv) {
      this.tooltipDiv.on('click', () => {

        d3.event.stopPropagation();
      })
    }

    this.element.addEventListener('click', ($event) => {

      $event.stopPropagation();
      console.log('container clicked')
      if (this.chartState.rectActive.selected) {
        this.onRemoveEffect();
      }
    })
  }

  // @HostListener('document:click', ['$event.target'])
  // onClick(targetElement) {
  //   console.log('document click')


  //   const clickedInside = this.tooltipDiv.nodes() === targetElement;

  //   console.log(clickedInside);
  //   if (!this.chartState.rectActive.selected) return;
  //   if (!clickedInside) {
  //     this.onRemoveEffect();
  //   }
  // }

  onRectMouseOver(self) {
    const bar = d3.select(self);
    const strokeWidth = 1;

    bar
      .attr('stroke', 'red')
      .attr('stroke-width', strokeWidth)
      .attr('cursor', 'pointer')
  }

  onRemoveEffect() {
    this.hideTooltipDIV();

    this.chartState.rectActive.selected = null;
    this.rectBars.attr('stroke-width', d => 0)
      .attr('opacity', d => 1)

  }


  onRectMouseOut(self) {
    const bar = d3.select(self);
    if (this.chartState.rectActive.selected &&
      this.chartState.rectActive.selected.attr('id') === bar.attr('id')) return;

    bar
      .attr('stroke-width', d => 0)
  }

  onRectMouseClick(self) {
    const bar = d3.select(self);

    if (!this.chartState.rectActive.selected || this.chartState.rectActive.selected.attr('id') !== bar.attr('id')) {
      this.chartState.rectActive.selected = bar
      /**
       * 
     * 
       * 
       * Highlight
       */
      // bar.
      //   attr('filter', 'url(#filter_brightness)')
      // .attr('stroke-width', d => d === bar.datum() ? 1 : 0)

      /**
       * 
       * Convert Highlight
       * 
       */
      this.rectBars
        .transition()
        .attr('opacity', d => d === bar.datum() ? 1 : 0.6)
        .attr('stroke-width', d => d === bar.datum() ? 1 : 0)

      this.tooltipDiv
        .select('#tooltip-action')
        .transition()
        .duration(300)
        .style('top', '-38px')

      // triggerDetail by Click
      this.getReportDetail(bar.datum());
    } else {

    }
  }

  appendFilters() {
    const filters = this.svg
      .append('defs')

    this.appendFilterBrightness(filters)
    this.appendFilterShadow(filters)
  }

  appendFilterBrightness(filters) {
    if (filters) {
      const filters = this.svg
        .append('defs')
    }

    const fetransfer =
      filters.append('filter')
        .attr('id', 'filter_brightness')
        .append('feComponentTransfer')

    fetransfer.append('feFuncR')
      .attr('type', 'linear')
      .attr('slope', 1.2)
    fetransfer.append('feFuncG')
      .attr('type', 'linear')
      .attr('slope', 1.2)
    fetransfer.append('feFuncB')
      .attr('type', 'linear')
      .attr('slope', 1.2)
  }

  appendFilterShadow(filters) {
    if (filters) {
      const filters = this.svg
        .append('defs');
    }

    filters.append('filter')
      .attr('id', 'shadow')
      .append('feDropShadow')
      .attr('dx', 1)
      .attr('dy', 1)
      .attr('stdDeviation', 2)
      .attr('flood-color', '#777s')
  }

  // appendtext() {
  //   /**
  //    * Bar Text
  //    */
  //   console.log(this.dataMock)
  //   const texts = this.svg.append('g')
  //     .attr('class', 'g-bar-text')
  //     .selectAll('.bar-text')
  //     .data(this.dataMock.map(d => d.value))
  //     .enter()
  //     .append('text')
  //     .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`)
  //     .attr('x', (d, i) => this.xScale(i))
  //     .attr('y', d => this.yScale(0) + this.padding.top)
  //     .attr('dx', d => this.xScale.bandwidth() / 2 - 16)
  //     .attr('dy', d => 0)
  //     .text(d => d)
  //     .attr('fill', 'rgb(78, 121, 167, 0)')
  //     .transition()
  //     .attr('fill', 'white')
  //     .delay((d, i) => i * 50)
  //     .duration(500)
  //     .ease(d3.easeQuadOut)
  //     .attr('y', d => this.yScale(d) + this.padding.top)
  //     .attr('height', d => this.height - this.padding.top - this.padding.bottom - this.yScale(d));
  // }

  stacked() {
    const self = this;
    this.yScale.domain([0, this.maxStacked])

    this.rectBars
      .transition()
      .delay((d, i) => this.chartState.xindex.indexOf(i) * 25)
      .duration(250)
      .ease(d3.easeQuadOut)
      .attr('y', d => this.yScale(d[1]))
      .attr('height', d => this.height - this.padding.top - this.padding.bottom - this.yScale(d[1] - d[0]))
      .transition()
      .call(this.endAll, this.transitionCallBack, self)
      .attr('width', this.xScale.bandwidth() - this.paddingScale(this.rectPadding))
      .attr('x', (d, i) => this.xScale(i) + this.paddingScale(this.rectPadding) / 2)

    this.yAxis.tickFormat(this.formatNumber)

    this.svg.selectAll(".axis-y").transition()
      .delay(100)
      .duration(250)
      .call(this.yAxis)
    this.svg.selectAll(".g-axis-y-line").transition()
      .delay(100)
      .duration(250)
      .call(this.yAxisLine).selectAll("line")
      .attr("stroke", "#777")

    this.svg.selectAll(".g-axis-y-line")
      .select("path")
      .remove()

    // this.rectBars.select('title')
    //   .attr('d', (d, i) => {

    //     return d
    //   })
    //   .text((d, i) => {
    //     return `${d.key}\nCount: ${d[3][d[2]]} of ${d3.sum(d[3])} \nMonth: ${this.dataMock[i].month}`
    //   })

  }

  grouped() {
    this.yScale.domain([0, this.maxGrouped])
    var activedKeyCount = d3.sum(this.chartState.keys.map(k => k.active ? 1 : 0))

    if (this.chartState.activeKeyCountPrev <= activedKeyCount) {
      this.groupAdd(activedKeyCount);
    } else {
      this.groupRemove(activedKeyCount);
    }
    this.yAxis.tickFormat(this.formatNumber)
    this.svg.selectAll(".axis-y").transition()
      .delay(100)
      .duration(250)
      .call(this.yAxis)
    this.svg.selectAll(".g-axis-y-line").transition()
      .delay(100)
      .duration(250)
      .call(this.yAxisLine).selectAll("line")
      .attr("stroke", "#777")

    this.svg.selectAll(".g-axis-y-line")
      .select("path")
      .remove()

    // this.rectBars.select('title')
    //   .attr('d', (d, i) => {
    //     // console.log(d, i);
    //     //  console.log('title', d, d[3][d[2]]); 
    //     return d
    //   })
    //   .text((d, i) => {
    //     return `${d.key}\nCount: ${d[3][d[2]]} of ${d3.sum(d[3])} \nMonth: ${this.dataMock[i].month}`
    //   })
  }

  groupAdd(activedKeyCount) {
    const self = this;

    this.rectBars
      .transition()
      .delay((d, i) => this.chartState.xindex.indexOf(i) * 25)
      .duration(250)
      .ease(d3.easeQuadOut)
      .attr('width', d => (this.xScale.bandwidth() - this.paddingScale(this.rectPadding)) / activedKeyCount
        //  - this.paddingScale(this.rectPadding) * (d[2] === 0 ?  1 : 0) 
      )
      .attr('x', (d, i) => this.xScale(i) + this.paddingScale(this.rectPadding) / 2 + (this.xScale.bandwidth() - this.paddingScale(this.rectPadding)) / activedKeyCount * (
        d3.sum(this.chartState.keys.map(key => key.active).filter((key, index) => index < d[2]))
      ))
      .transition()
      .call(this.endAll, this.transitionCallBack, self)
      .attr('y', d => this.yScale(d[1] - d[0]))
      .attr('height', d => this.height - this.padding.top - this.padding.bottom - this.yScale(d[1] - d[0]))
  }

  groupRemove(activedKeyCount) {
    const self = this;

    this.rectBars
      .transition()
      .delay((d, i) => this.chartState.xindex.indexOf(i) * 25)
      .duration(250)
      .ease(d3.easeQuadOut)
      .attr('y', d => this.yScale(d[1] - d[0]))
      .attr('height', d => this.height - this.padding.top - this.padding.bottom - this.yScale(d[1] - d[0]))
      .transition()
      .call(this.endAll, this.transitionCallBack, self)
      .attr('width', d => (this.xScale.bandwidth() - this.paddingScale(this.rectPadding)) / activedKeyCount
        //  - this.paddingScale(this.rectPadding) * (d[2] === 0 ?  1 : 0) 
      )
      .attr('x', (d, i) => this.xScale(i) + this.paddingScale(this.rectPadding) / 2 + (this.xScale.bandwidth() - this.paddingScale(this.rectPadding)) / activedKeyCount * (
        d3.sum(this.chartState.keys.map(key => key.active).filter((key, index) => index < d[2]))
      ))

  }


  percent() {
    const self = this;

    this.yScale.domain([0, 1])

    this.rectBars
      .transition()
      .delay((d, i) => this.chartState.xindex.indexOf(i) * 25)
      .duration(250)
      .ease(d3.easeQuadOut)
      .attr("y", (d, i) => {
        var total = d3.sum(d[3]);
        return this.yScale(d[1] / total);
      })
      .attr("height", (d) => {
        var total = d3.sum(d[3]);
        return this.yScale(d[0] / total) - this.yScale(d[1] / total);
      })
      .transition()
      .call(this.endAll, this.transitionCallBack, self)
      .attr('width', this.xScale.bandwidth() - this.paddingScale(this.rectPadding))
      .attr('x', (d, i) => this.xScale(i) + this.paddingScale(this.rectPadding) / 2)
    // .selectAll('title')
    // .text((d, i) => {
    //   var total = d3.sum(d[3]);
    //   var percent = Math.round((d[1] - d[0]) / total * 100);
    //   // console.log(d, total)
    //   return `${d.key} \nPercent: ${percent}% \nMonth: ${this.dataMock[i].month}`
    // })


    this.yAxis.tickFormat(this.formatPercent)

    this.svg.selectAll(".axis-y").transition()
      .delay(100)
      .duration(250)
      .call(this.yAxis)
    this.svg.selectAll(".g-axis-y-line").transition()
      .delay(100)
      .duration(250)
      .call(this.yAxisLine).selectAll("line")
      .attr("stroke", "#777")
    this.svg.selectAll(".g-axis-y-line")
      .select("path")
      .remove()
  }

  clearChart() {
    this.svg.selectAll("g")
      .remove()
      .exit()
  }

  initData() {
    this.isFilterExists = !!this.retrieveFilters();
    const timespan = this.isFilterExists ? this.retrieveFilters().timeSpan : {};

    this.service.getReportOperational({ ...timespan });
    /** @TODO Raw Month
     *  this should get from RawData extract from Rawdata
     */
    return;
    //this.months = 
    // this.getMonths();
    /** @TODO Raw data from DB */
    // this.rawData = d3
    //   .range(this.chartState.keys.length)
    //   .map(() => bumps(this.months.length));

    // this.colors = d3.scaleOrdinal(['#98b8c7', '#6f9bb0', '#31708e', '#81BEB0', '#D4EAD9'])
    //   .domain([0, this.chartState.keys.length])

    /** @TODO 
     *  this should be the mock data converted from rawData used by Chart
     *  dataMock should not be changed
     */
    // this.dataMock = this.months.map((m, i) => {
    //   var object = { 'month': m }
    //   this.chartState.keys.forEach((key, index) => object[key.name] = this.rawData[index][i])
    //   return object;
    // })

    // console.log("DEBUG_DATAMOCK", this.dataMock)
    // var test2 = d3.stack().keys(this.chartState.keys.map(key => key.name))(this.dataMock)

    // // console.log(test2);
    // var test3 = test2
    //   .map((d, i) => d.map(data =>
    //     // start, end,  index, [value1, value2, ..... valueN]
    //     [data[0], data[1], d.key, data.data])
    //   );
    // console.log(test3)
  }

  initState() {
    this.reportChanged$ = this.service.reportOperationalReady.subscribe((reports: ReportOperational[]) => {
      this.onReportChanged(reports)
    });

    this.service.windowResized.subscribe(() => this.onResize());
  }

  onReportChanged(reports: ReportOperational[]) {
    reports.forEach((report: ReportOperational) => report.month = report.month.slice(0, 10));
    this.reportData = reports;

    if (this.reportData.length === 0)
      return;

  
    if (this.isFilterExists && this.retrieveFilters().keys) {
      const keysParams = this.retrieveFilters().keys;
      this.chartState.keys = keysParams;
      this.chartState.activeKeyCountPrev = this.retrieveFilters().activeKeyCountPrev;
    } else {
      const keys = this.objectKeys(this.reportData[0]).filter(key => key !== 'month');
      this.chartState.keys = keys.map(key => {
        return { 'name': key, 'active': true }
      });
    }


    if (this.isFilterExists && this.retrieveFilters().schemaActive) {
      this.chartState.schemaActive = this.retrieveFilters().schemaActive;
    } 

    this.colors = d3.scaleOrdinal(['#31708e', '#6f9bb0', '#98b8c7', '#81BEB0', '#D4EAD9'])
      .domain([0, this.chartState.keys.length])

    /**@FIXME Adjust execute order*/

    this.groupMonths();
    this.clearSelection();

    // if (this.isFilterExists && this.retrieveFilters().monthSelected) {
    //   this.retrieveFilters().monthSelected.forEach(month => this.selection.select(month));
    //   this.selection.sort((a, b) => Date.parse(a) - Date.parse(b))
    // } else {
      this.masterToggle();
    // }
    // return;

    this.updateData();
    if (this.svg) {
      this.onRemoveEffect();
      this.clearChart();
    }
    this.updateBase()
    this.updateScale();
    this.initLegend();
    this.initChart();

    this.isFilterExists = false;
  }

  updateData() {
    this.filterdDataMock = this.reportData
      .map((d, i) => {
        var obj = { ...d };
        this.chartState.keys.forEach(key => {
          obj[key.name] = key.active ? obj[key.name] : 0
        })
        return obj;
      })
      .filter((d: ReportOperational, i) => this.selection.selected.includes(d.month))


    // start, end,  index, [value1, value2, ..... valueN]
    this.stackedData = d3.stack()
      .keys(this.chartState.keys.map(key => key.name))(this.filterdDataMock)
      .map((d, i) =>
        d.map(data => {
          var array = this.chartState.keys.map(key => data.data[key.name]);
          data.push(i);
          data.push(array);
          data.key = d.key;
          return data;
        })
      );
    console.log("DEBUG Filtered_Data", this.filterdDataMock)
    console.log("DEBUG Stacked_Data", this.stackedData)

    /**
     * Update StackedData
     */
    // this.stackedData = d3.stack()
    //   .keys(d3.range(this.chartState.keys.length))(d3.transpose(dataset))
    //   .map((d, i) => d.map(data =>
    //     // start, end,  index, [value1, value2, ..... valueN]
    // [data[0], data[1], i, data.data])
    //   );

    /** Update chart max */
    this.maxGrouped = d3.max(this.stackedData[0].map(d => d[3]), y => d3.max(y))
    this.maxStacked = d3.max(this.stackedData, y => d3.max(y, d => d[1]))
  }

  updateCategory() {
    this.updateData()

    this.svg
      .selectAll('.g-stack')
      .data(this.stackedData)
      .selectAll('rect')
      .data(d => d)
      .selectAll('title')
      .data((d, i) => {
        return d[3][d[2]]
      })

    // this.rectBars.select('title')
    //   .attr('d', (d, i) => {
    //     return d
    //   })
    //   .text((d, i) => {
    //     return `Count: ${d[3][d[2]]} of ${d3.sum(d[3])} 
    //     Month: ${    this.dataMock[i].month}`
    //   })

    this.onRemoveEffect();
    this.updateLegend();
    this.updateChart();

    this.chartState.activeKeyCountPrev = d3.sum(this.chartState.keys.map(k => k.active ? 1 : 0))
  }

  updateChart() {
    if (this.chartState.schemaActive === 'Grouped') {
      this.grouped();
    } else if (this.chartState.schemaActive === 'Percent') {
      this.percent();
    } else {
      this.stacked();
    }
  }

  transitionSort() {
    if (this.chartState.schemaActive === 'Grouped') {
      this.rectBars.transition()
        .duration(500)
        // .delay((d, i) => i * 25)
        .attr('x', (d, i) => this.xScale(i) + this.paddingScale(this.rectPadding) / 2 + (this.xScale.bandwidth() - this.paddingScale(this.rectPadding)) / this.chartState.activeKeyCountPrev * (
          d3.sum(this.chartState.keys.map(key => key.active).filter((key, index) => index < d[2]))
        ))
    } else {
      this.rectBars.transition()
        .duration(500)
        // .delay((d, i) => i * 25)
        .attr('x', (d, i) => this.xScale(i) + this.paddingScale(this.rectPadding) / 2)
    }

    this.svg.select('.axis-x').selectAll(".tick")
      .transition()
      .duration(500)
      .attr("transform", (d, i) => `translate(${this.xScale(i) + this.xScale.bandwidth() / 2}, ${0})`)
  }

  refreshChart() {
    if (this.svg) {
      this.updateData();
      this.clearChart();
      this.onRemoveEffect();
      this.updateScale();
      this.initLegend();
      this.initChart();
    }
  }

  onMonthSelect(month: string) {
    this.monthToggle(month)
    this.refreshChart();
  }

  monthToggle(month) {
    this.selection.toggle(month);
    this.selection.sort((a, b) => Date.parse(a) - Date.parse(b));
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.months.forEach(month => this.selection.select(month));

    this.selection.sort((a, b) => Date.parse(a) - Date.parse(b))
  }

  clearSelection() {
    this.selection.clear();
  }

  onMasterToggle() {
    this.masterToggle();
    this.refreshChart();
  }

  yearToggle(year) {
    this.isYearSelected(year) ?
      this.monthGrouped[year].forEach(month => this.selection.deselect(month)) :
      this.monthGrouped[year].forEach(month => this.selection.select(month));

    this.selection.sort((a, b) => Date.parse(a) - Date.parse(b));
  }

  onYearToggle(year) {
    this.yearToggle(year);
    this.refreshChart();
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.months.length;
    return numSelected == numRows;
  }

  isYearSelected(year) {
    const numSelected = this.getNumYearSelected(year).length;
    const numRows = this.monthGrouped[year].length
    return numSelected == numRows;
  }

  selectYearSelection(year) {
    this.getNumYearSelected(year).forEach(month => this.selection.select(month));
  }

  getNumYearSelected(year) {
    return this.selection.selected.filter(y =>
      //  new Date(Date.parse(y)).getUTCFullYear() == year
      y.substring(0, 4) == year
    );
  }

  onSchemaSelected($e) {
    this.onRemoveEffect();
    this.updateChart();
  }

  isCategoryDisable(key) {
    var condition = this.chartState.keys.filter(k => k.active).length <= 1;
    var condition2 = key.active;

    return condition && condition2;
  }

  // initForm() {
  //   this.searchForm = this.fb.group({
  //     startDate: '',
  //     endDate: '',
  //   }, {
  //       validator: this.dateInputValidator
  //     });
  // }

  initToolTipSVG() {
    this.svg
      .append('g')
      .attr('class', 'g-tootip')
      .append('defs')
      .append('filter')
      .attr('id', 'shadow')
      .append('feDropShadow')
      .attr('dx', 1)
      .attr('dy', 1)
      .attr('stdDeviation', 2)
      .attr('flood-color', '#777s')

    this.tooltipSVG = this.svg.select('.g-tootip')

      .append('rect')
      .attr('id', 'tooltip-rect')
      .attr('height', this.chartState.tooltip.tooltipH)
      .attr('width', this.chartState.tooltip.tooltipW)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', '#fff')
      .attr('stroke', '#eee')
      .style('filter', 'url(#shadow)')

    this.svg.select('.g-tootip').append('text').attr('id', 'tooltip-text')
      .datum({ x: 0, y: 0 })
      .text(d => `${d.x}, ${d.y}`)
      .attr('transform', 'translate(0, 0)')
      .attr('fill', '#555')
  }

  initToolTipDIV() {
    if (this.tooltipDiv) return;

    /** text  model */
    const text = [{ name: 'name1', value: 0 },
    { name: 'name1', value: 0 },
    { name: 'name1', value: 0 },
    { name: 'name1', value: 0 },
    { name: 'name1', value: 0 }]

    const clientRect = this.svg.node().getBoundingClientRect();

    this.tooltipDiv = d3.select(this.element)
      .append('div')
      .attr("class", "tooltip")
      .attr("id", "tooltip-div")
      // .style('height', `${this.chartState.tooltip.tooltipH}px`)
      // .style('width', `${this.chartState.tooltip.tooltipW}px`)
      .style('left', `0px`)
      .style('top', `0px`)
      .style('box-shadow', '0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12)')
      .style('border-radius', `6px`)

    // .style('padding', `12px`)

    this.tooltipDiv
      .append('section')
      .attr('id', 'tooltip-action')
      .style('width', '100%')
      .style('position', 'absolute')
      .style('padding', `6px 12px`)
      .style('background-color', `#fff`)
      .style('border-radius', `6px 6px 0 0`)
      .style('top', '-6px')
      .selectAll('button')
      .data(this.btns)
      .enter()
      .append('button')
      .attr('class', 'btn btn-light')
      .attr('id', d => `btn-${d.Name}`)
      .style('padding', '0px 6px')
      .style('font-sisze', '12px')
      .style('margin-right', '6px')
      .text(d => d.Name)
    // .on('click', d => d.onClick)
    //

    this.tooltipDiv
      .append('section')
      .attr('id', 'tooltip-info')
      .style('padding', `6px 12px 12px 12px`)
      .style('border-radius', ` 0 0 6px 6px`)
      .style('position', 'relative')
      .style('background-color', `#fff`)
      .style('min-width', `210px`)
      .selectAll('div')
      .data(text)
      .enter()
      .append('div')
      .selectAll('span')
      .data(d => Object.entries(d))
      .enter()
      .append('span')
      .text(d => d[1])
      .style('padding-right', d => d[0] === 'name' ? '12px' : '0px')
  }

  displayTooltipSVG(data) {
    const clientRect = this.svg.node().getBoundingClientRect();

    this.tooltipSVG
      .attr('x', d3.event.pageX - 40)
      .attr('y', d3.event.pageY - 360)

    this.svg.select('.g-tootip').select('#tooltip-text')
      .datum(data)
      .text((d, i) => {
        return `${d.key}\n\t
        Month: ${d.month}\n\t
        Count: ${d[3][d[2]]}\n\t
        Total: ${d3.sum(d[3])}\n\t
        Percent: ${Math.round((d[1] - d[0]) / d3.sum(d[3]) * 100)}%`;
      })
      .attr('x', d3.event.pageX - clientRect.x + 30)
      .attr('y', d3.event.pageY - clientRect.y + 30)

  }

  displayTooltipDIV(data) {
    const clientRect = this.svg.node().getBoundingClientRect();

    const text = [
      { name: 'Description', value: data.key.split('_').slice(1).join(' ') },
      { name: 'Month', value: data.data['month'] },
      { name: 'Count', value: data.data[data.key] },
      { name: 'Total', value: d3.sum(data[3]) },
      { name: 'Percent', value: `${Math.round(data.data[data.key] / d3.sum(data[3]) * 100)}%` },
    ]

    this.tooltipDiv
      .style('display', 'block')
      .style('opacity', () => this.chartState.rectActive.selected ? 1 : 0.9)
      .style('left', `${d3.event.pageX - clientRect.x + 30}px`)
      .style('top', `${d3.event.pageY - clientRect.y + 30}px`)
      // .transition()
      .selectAll('div')
      .data(text)

    this.tooltipDiv
      .select('#tooltip-info')
      .selectAll('div')
      .data(text)
      .selectAll('span')
      .data(d => Object.entries(d))
      .text(d => d[1])

    this.tooltipDiv
      .select('#tooltip-action')
      .selectAll('button')
      .data(this.btns)
      .on('click', d => d.onClick(data))
  }

  hideTooltipDIV() {
    if (!this.tooltipDiv) return;
    this.tooltipDiv.style('opacity', 0)
      .style('display', 'none')

    this.tooltipDiv
      .select('#tooltip-action')
      .style('top', '-6px')
  }

  endAll(transition, callback, self) {
    var n;
    callback(true, self);
    if (transition.empty()) {
      callback(false, self);
    }
    else {
      n = transition.size();
      transition.on("end", () => {
        n--;
        if (n === 0) {
          callback(false, self);
        }
      });
    }
  }

  transitionCallBack(transitioning, self) {
    // console.log(self, self.chartState)
    self.chartState.transitioning = transitioning;
  }



  onDateApplied(e) {
    this.chartState.timeSpanApplied = {
      endDate: e.endDate ? e.endDate : null,
      startDate: e.startDate ? e.startDate : null
    };
    this.service.getReportOperational(e);
  }

  onSaveFilters() {

    let chartStateParams = {
      schemaActive: this.chartState.schemaActive,
      keys: this.chartState.keys,
      activeKeyCountPrev: this.chartState.activeKeyCountPrev,
      timeSpan: this.chartState.timeSpanApplied,
      monthSelected: this.selection.selected
    };
    localStorage.setItem('report_operational', JSON.stringify(chartStateParams));

    // this.openSnackBar('Filters Saved', 'Dismiss');
  }

  retrieveFilters() {
    if (!localStorage.getItem('report_operational'))
      return null;

    const chartStateParams = JSON.parse(localStorage.getItem('report_operational'));
    return chartStateParams;
  }

  download_csv() {
    const report = this.filterdDataMock;
    const FILENAME = `Revrec2Discrepancies_Operational_${moment().format('MMM_DD_YYYY_hhmmA')}.csv`;
    this.service.downloadTest(report, FILENAME);
  }

  onRefresh() {
    this.service.getReportOperational(this.chartState.timeSpanApplied);
  }

  onSort() {
    if (this.chartState.transitioning)
      return;

    if (this.chartState.sorted = !this.chartState.sorted) {
      this.chartState.xindex = d3.range(this.filterdDataMock.length).sort((a, b) => {
        var diff = d3.sum(this.chartState.keys.map(d => this.filterdDataMock[a][d.name]))
          - d3.sum(this.chartState.keys.map(d => this.filterdDataMock[b][d.name]))
        return diff
      });
    } else {
      this.chartState.xindex = d3.range(this.filterdDataMock.length)
    }

    this.xScale
      .domain(this.chartState.xindex);

    this.onRemoveEffect();
    this.transitionSort();
  }

  onExportDiscrepancy(rect: any) {
    const keys = rect.key.split('_');
    const month = rect.data.month;
    const isEnrolled = keys[1];
    const isResolved = keys[2];
    // const pageRequest = {
    //   pageIndex: con1.pageIndex ? con1.pageIndex : 0,
    //   pageSize: con1.pageSize ? con1.pageSize : 25,
    //   sortBy: con1.sortBy ? con1.sortBy : '',
    //   orderBy: con1.orderBy ? con1.orderBy : '',
    // };
    var discrepancyStatuses = this.settingService.getOptions('discrepancyStatus').filter((ds: DiscrepancyStatusOption) => {
      return isResolved === 'Resolved' ? ds.discrepancyCategoryIsResolved : !ds.discrepancyCategoryIsResolved
    });
    const filters = {
      memberIsEnrolled: isEnrolled === 'Member' ? 1 : 0,
      months: [month],
      discrepancyStatusIDs: discrepancyStatuses.map((ds: DiscrepancyStatusOption) => ds.discrepancyStatusID),
      exportAll: 1,
      includeResolved: true
    }
    // console.log(filters, discrepancyStatuses, this.settingService.getOptions('discrepancyStatus'))
    var report$ = this.sharedService.getDiscrepancyReport({}, filters)
      .subscribe(result => {
        // console.log(result)
        // this.isReportDownloading = false;
        // console.log(" Get Discrepancy Report =>", result.data)
        // this.openSnackBar('Download Finished', 'Ok', 2);

        const FILENAME = `Revrec2Operational_${month}_${isEnrolled}_${isResolved}_${moment().format('MMM_DD_YYYY_hhmmA')}.csv`;
        this.service.downloadTest(result.data.list, FILENAME);
      });
  }


  onRedirectDiscrepancy(rect: any) {
    const keys = rect.key.split('_');
    const month = rect.data.month;
    const isEnrolled = keys[1];
    const isResolved = keys[2];

    var discrepancyStatuses = this.settingService.getOptions('discrepancyStatus').filter((ds: DiscrepancyStatusOption) => {
      return isResolved === 'Resolved' ? ds.discrepancyCategoryIsResolved : !ds.discrepancyCategoryIsResolved
    });
    const filters = {
      /** @TODO TEMP Value 20 => non-member */
      memberEnrollmentStatus: isEnrolled === 'Member' ? 21 : 20,
      months: [month],
      discrepancyStatusIDs: discrepancyStatuses.map((ds: DiscrepancyStatusOption) => ds.discrepancyStatusID),
      includeResolved: true
    }
    const navData = {
      previousRoute: 'report/operational',
      nextRoute: 'discrepancies',
      data: filters
    };
    this.navService.onNav(navData);
    this.router.navigate(['/discrepancies']);

  }

  getReportDetail(rect) {
    const keys = rect.key.split('_');
    const mon = rect.data.month;
    const isEnrolled = keys[1] === 'Member' ? 1 : 0;
    const isResolved = keys[2] === 'Resolved' ? 1 : 0

    if (this.chartState.selectedDetail.month === mon
      && this.chartState.selectedDetail.isEnrolled === isEnrolled
      && this.chartState.selectedDetail.isResolved === isResolved)
      return;

    this.chartState.selectedDetail.isEnrolled = isEnrolled;
    this.chartState.selectedDetail.isResolved = isResolved;
    this.chartState.selectedDetail.month = mon
    this.chartState.selectedDetail.isSelected = true;

    this.service.getReportOperationalDetail(this.chartState.selectedDetail);
  }

  reportDetailLabel() {
    const isEnrolled = this.chartState.selectedDetail.isEnrolled === null ? '' :
      (this.chartState.selectedDetail.isEnrolled ? 'Member' : 'Non-Member');
    const isResolved = this.chartState.selectedDetail.isResolved === null ? '' :
      (this.chartState.selectedDetail.isResolved ? 'Resolved' : 'Unresolved');

    return this.chartState.selectedDetail.isSelected ? `${this.chartState.selectedDetail.month}  - ${isEnrolled} ${isResolved} ` : 'Detail';
  }
}



// function bumps(m) {
//   const values = [];

//   for (let i = 0; i < m; ++i) {
//     values[i] = Math.floor(500 + 1000 * Math.random());
//   }

//   // Add five random bumps.
//   for (let j = 0; j < 4; ++j) {
//     const x = 1 / (1 + Math.random());
//     const y = 1 * Math.random() - 0.5;
//     const z = 10 / (1 + Math.random());
//     for (let i = 0; i < m; i++) {
//       const w = (i / m - y) * z;
//       values[i] += Math.floor(x * Math.exp(-w * w));
//     }
//   }

//   // Ensure all values are positive.
//   for (let i = 0; i < m; ++i) {
//     values[i] = Math.max(0, values[i]);
//   }

//   return values;
// }

