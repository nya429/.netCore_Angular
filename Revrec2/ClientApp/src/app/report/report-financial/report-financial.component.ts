
import { Component, OnInit, ElementRef, ViewChild, Input, OnDestroy } from '@angular/core';
import { transition } from '@angular/animations';
import * as d3 from 'd3';
import * as d3Chromatic from 'd3-scale-chromatic';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ReportService } from '../report.service';
import { Subscription } from 'rxjs';
import { MatCalendar, MatMenu, MatMenuTrigger } from '@angular/material';
import { SharedService } from './../../shared/shared.service';
import { SettingService } from 'src/app/setting/setting.service';
import { ReportFinancial, ReportOperational } from './../../model/report.model';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';
import { DiscrepancyStatusOption } from 'src/app/model/setting.model';
import { NavigationService } from 'src/app/navigation/navigation.service';
import { Router } from '@angular/router';
const moment = _rollupMoment || _moment;



type MonthGrouped = { year: number, month: string[] };

const MONTH_STR = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
@Component({
  selector: 'app-report-financial',
  templateUrl: './report-financial.component.html',
  styleUrls: ['./report-financial.component.css']
})
export class ReportFinancialComponent implements OnInit, OnDestroy {
  @ViewChild('BarChart') private chartContainer: ElementRef;
  // @ViewChild('Filter') private filterContainer: ElementRef;

  // selectedDate: Moment;

  // @Input() private data: Array<any>;

  svg;
  element;
  element2;

  private windowResize$: Subscription;
  private reportChanged$: Subscription;

  reportData: ReportFinancial[];
  filterdData;

  private isFilterExists;

  private resizeTimer;
  // private rawData;
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
  private minGrouped;
  private minStacked;

  private formatPercent = d3.format(".0%");
  private formatNumber = d3.format("$,");


  private colors: any;
  private xAxisLine: any;
  private xAxis: any;
  private yAxis: any;
  private rectBars: any;
  private legend: any;
  private tooltipSVG: any;
  private tooltipDiv: any;

  private schema: string = 'stacked';

  // public searchForm: FormGroup;
  public chartState = {
    yindex: [],
    sorted: false,
    /**  @TODO Should be configurble */
    schemaActive: 'Stacked',
    schemaOptions: ['Stacked', 'Grouped'],
    /**  @TODO Should be configurble */
    keys: [
      { name: 'Underpay Member unresolved', active: true, offset: 'negative' },
      { name: 'Overpay Member unresolved ', active: true, offset: 'positive' },
      { name: 'Underpay Member resolved', active: true, offset: 'negative' },
      { name: 'Overpay Member unresolved', active: true, offset: 'positive' },
      { name: 'Underpay Non-member unresolved', active: true, offset: 'negative' },
      { name: 'Overpay Non-member unresolved', active: true, offset: 'positive' },
      { name: 'Underpay Non-member resolved', active: true, offset: 'negative' },
      { name: 'Overpay Non-member resolved', active: true, offset: 'positive' }],
    // these two need to be dynamic
    activeKeyCountPrevPositive: 4,
    activeKeyCountPrevNegative: 4,
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
    timeSpanFetched: {
      startDate: null,
      endDate: null
    },
    timeSpanApplied: {
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

  public months = [];

  public monthGrouped: MonthGrouped = {} as MonthGrouped;
  public objectKeys = Object.keys;
  public selection = new SelectionModel<string>(true, []);


  constructor(private fb: FormBuilder,
    private service: ReportService,
    private settingService: SettingService,
    private sharedService: SharedService,
    private navService: NavigationService,
    private router: Router) { }


  ngOnInit() {
    // this.masterToggle();
    // this.element2 = this.filterContainer.nativeElement;
    this.initData();
    // this.initForm();
    this.initState();

    this.element = this.chartContainer.nativeElement;

    return;
    this.updateData();
    setTimeout(() => {
      this.updateBase()
      this.updateScale();
      this.initLegend();
      this.initChart();
      this.windowResize$ = this.service.windowResized.subscribe(() => this.onResize());
    }, 400);
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
    if (!this.svg)
      return;

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


  // getMonths() {
  //   // Revrec2 file processing back to 2018-01-01
  //   const monthStart = '2018-01-01';

  //   const e = new Date(Date.parse(monthStart));
  //   const eMonth = e.getUTCMonth() + 1;
  //   const eYear = e.getUTCFullYear();

  //   const current = new Date();
  //   const currentMonth = current.getUTCMonth() + 1;
  //   const currentYear = current.getUTCFullYear();

  //   let months = [];
  //   // for (let year = currentYear; year > eYear; year--) {
  //   for (let year = eYear; year <= currentYear; year++) {
  //     for (let month = 1; month <= 12; month++) {
  //       if (year === currentYear && month > currentMonth) {
  //         break;
  //       } else if (year !== currentYear || (year === currentYear && month <= currentMonth)) {
  //         const mon = `${year}-${month > 9 ? month : "0" + month}-01`;
  //         months.push(mon);
  //       }
  //     }
  //   }
  // this.monthtest = {};
  // for (let year = eYear; year <= currentYear; year++) {
  //   var obj = { year: year, month: [] };
  //   // this.monthtest.push(obj)
  //   this.monthtest[year] = []

  //   for (let month = 1; month <= 12; month++) {
  //     if (year === currentYear && month > currentMonth) {
  //       break;
  //     } else if (year !== currentYear || (year === currentYear && month <= currentMonth)) {
  //       const mon = `${year}-${month > 9 ? month : "0" + month}-01`;
  //       // obj.month.push(mon);
  //       this.monthtest[year].push(mon)
  //     }
  //   }
  // }
  //   this.months = months;
  // }

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
    // this.height = this.element2.offsetHeight - this.margin.top - this.margin.bottom;
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
      this.chartState.yindex = d3.range(this.filterdData.length).sort((a, b) => {
        var diff = d3.sum(this.chartState.keys.map(d => this.filterdData[a][d.name]))
          - d3.sum(this.chartState.keys.map(d => this.filterdData[b][d.name]))
        return diff
      });
    } else {
      this.chartState.yindex = d3.range(this.filterdData.length)
    }
    // this.chartState.xindex = d3.range(this.filterdData.length);

    // month related 
    this.xScale = d3.scaleLinear()
      /** @FIXME fix month binding when resize */
      // .domain(d3.range(this.reportData.length))
      .domain([this.minStacked, this.maxStacked])
      .range([0, this.width - this.padding.left - this.padding.right]);

    //month related
    this.yScale = d3.scaleBand()
      // .domain([0, d3.max(this.dataMock.map(d => d.value))])
      .domain(this.chartState.yindex)
      .range([0, this.height - this.padding.bottom - this.padding.top]);


    //   // month related 
    //   this.xScale = d3.scaleLinear()
    //     .domain([this.minStacked, this.maxStacked])
    //     .range([0, this.width - this.padding.left - this.padding.right]);

    //   //schema related
    //   this.yScale = d3.scaleBand()
    //     .domain(d3.range(this.dataMock.length))
    //     // .domain([0, d3.max(this.dataMock.map(d => d.value))])
    //     .range([0, this.height - this.padding.bottom - this.padding.top]);
  }

  initLegend() {
    // rect size
    var size = 12;
    // text font size
    var fontSize = 12;
    const data = this.chartState.keys.map(key => {
      return { name: key.name.split('_').join(' '), active: key.active, offset: key.offset }
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
        var len = data.filter((d, index) => i >= index && d.active && index > 0).reduce((acc, cur) => acc + cur.name.length, 0);
        // console.log(d.name.length, i, len)
        return `translate(${- len * fontSize * 0.6 - size * (i + 1)}, ${this.padding.top / 3})`;
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
    // rect size
    var size = 12;
    // text font size
    var fontSize = 12;
    const data = this.chartState.keys.map(key => {
      return { name: key.name.split('_').join(' '), active: key.active, offset: key.offset }
    })

    this.legend = this.svg
      .select('.g-legend')
      .selectAll(".legend")
      .data(data)
      .transition()
      .attr('opacity', (d, i) => d.active ? 1 : 0)
      .attr('transform', (d, i) => {
        var len = data.filter((d, index) => i >= index && d.active && index > 0).reduce((acc, cur) => acc + cur.name.length, 0);
        // console.log(d, i, len)
        return `translate(${- len * fontSize * 0.6 - size * (i + 1)}, ${this.padding.top / 3})`;
      })
  }

  initChart() {
    const self = this;

    //schema related
    // console.log(this.minStacked, this.maxStacked)
    this.xScale.domain([this.minStacked, this.maxStacked]);

    this.paddingScale = d3.scaleLinear()
      .domain([0, 5])
      .range([0, this.yScale.bandwidth() / 2]);


    this.yAxis = d3.axisLeft(this.yScale)
      .tickFormat((d, i) =>
        // d3.timeFormat("%B %Y")(Date.parse(
        this.reportData[i].month
        // ))
      );

    this.xAxis = d3.axisBottom(this.xScale)
      .tickArguments([20, 's']);

    this.xAxisLine = d3.axisBottom(this.xScale)
      .tickSize(this.height - this.padding.bottom - this.padding.top)
      .tickFormat('')


    const x = this.svg.append('g')
      .attr('class', 'g-axis-x');

    x.append('g')
      .attr('class', 'axis-x')
      .attr('transform', `translate(${this.padding.left}, ${this.height - this.padding.bottom})`)
      .call(this.xAxis)


    const y = this.svg.append('g')
      .attr('class', 'g-axis-y');

    y.append('g')
      .attr('class', 'axis-y')
      .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`)
      .call(this.yAxis)
    // .select(".g-axis-y")


    y.selectAll('text') // `text` has already been created
      .attr('text-anchor', 'end')
      .text((d, i) => MONTH_STR[new Date(Date.parse(
        //this.dataMock[i].month
        this.selection.selected[i]))
        .getUTCMonth()]
        + " " + new Date(Date.parse(
          //this.dataMock[i].month
          this.selection.selected[i])).getUTCFullYear())
    // .attr('dy', '-0.5em')
    // .append('tspan')
    // .attr("x", "-9")
    // .attr('dy', '1.5em')
    // .text((d, i) => new Date(Date.parse(this.dataMock[i].month)).getUTCFullYear())

    this.svg.append('g')
      .attr('class', 'g-axis-x-line')
      .attr("stroke", "#777")

      .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`)
      .call(this.xAxisLine)
      .selectAll("line")
      .attr("stroke", "#777")

    this.svg.selectAll(".g-axis-y-line")
      .select("path")
      .remove()

    // this.rectBars = this.svg.append('g')
    //   .attr('class', 'g-bar')
    //   .selectAll('rect')
    //   .data(this.dataMock.map(d => d.value))
    //   .enter()
    //   .append('rect');

    this.rectBars = this.svg.append('g')
      .attr('class', 'g-test-data')
      .selectAll('g')
      .data(this.stackedData)
      .enter()
      .append('g')
      .attr('class', 'g-stack')
      .attr('id', (d, i) => this.chartState.keys[i].name)
      .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`)
      .attr('fill', (d, i) => {
        // console.log(i, this.colors(i)); 
        return this.colors(i)
      })
      // .attr('fill', 'red')
      .selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('d', d => d[3][d[2]])
      .attr('id', (d, i) => `${d.key} ${d.data.month}`)
      .attr('opacity', 1)


    this.rectBars
      .attr('x', (d, i) => this.xScale(0))
      .attr('y', (d, i) => this.yScale(i) + this.paddingScale(this.rectPadding) / 2)
      .attr('width', d => 0)
      .attr('height', this.yScale.bandwidth() - this.paddingScale(this.rectPadding))

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
        // console.log(this.chartState.rectActive.selected)
        if (!this.chartState.rectActive.selected) {
          this.hideTooltipDIV();
        }
      })
      .on('click', (d, i, nodes) => {
        // console.log('rect click', d3.event, this.chartState.transitioning)

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

      this.rectBars
        .transition()
        .attr('opacity', d => d === bar.datum() ? 1 : 0.6)
        .attr('stroke-width', d => d === bar.datum() ? 1 : 0)

      this.tooltipDiv
        .select('#tooltip-action')
        .transition()
        .duration(300)
        .style('top', '-38px')

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
    this.xScale.domain([this.minStacked, this.maxStacked])

    this.rectBars
      .transition()
      .delay((d, i) => i * 50)
      .duration(500)
      .ease(d3.easeQuadOut)
      .attr('x', d => { return this.xScale(d[0]) })
      .attr('width', d => { return this.xScale(d[1]) - this.xScale(d[0]) })
      .transition()
      .call(this.endAll, this.transitionCallBack, self)
      .attr('height', this.yScale.bandwidth() - this.paddingScale(this.rectPadding))
      .attr('y', (d, i) => this.yScale(i) + this.paddingScale(this.rectPadding) / 2)

    this.xAxis.tickFormat(this.formatNumber)
    this.svg.selectAll(".axis-x").transition()
      .delay(200)
      .duration(500)
      .call(this.xAxis)
    this.svg.selectAll(".g-axis-x-line").transition()
      .delay(200)
      .duration(500)
      .call(this.xAxisLine).selectAll("line")
      .attr("stroke", "#777")
  }

  grouped() {
    this.xScale.domain([this.minGrouped, this.maxGrouped])
    var activedKeyCountPostive = d3.sum(this.chartState.keys.map((k, i) => k.active && k.offset === 'positive' ? 1 : 0))
    var activedKeyCountNegative = d3.sum(this.chartState.keys.map((k, i) => k.active && k.offset === 'negative' ? 1 : 0))

    console.log(this.chartState, this.chartState.activeKeyCountPrevPositive, activedKeyCountPostive, this.chartState.activeKeyCountPrevNegative, activedKeyCountNegative)

    if (this.chartState.activeKeyCountPrevPositive < activedKeyCountPostive || this.chartState.activeKeyCountPrevNegative < activedKeyCountNegative || (this.chartState.activeKeyCountPrevPositive === activedKeyCountPostive && this.chartState.activeKeyCountPrevNegative === activedKeyCountNegative)) {
      this.groupAdd();
    } else {
      this.groupRemove();
      // this.groupRemove(activedKeyCount);
    }
    this.yAxis.tickFormat(this.formatNumber)
    this.svg.selectAll(".axis-x").transition()
      .delay(200)
      .duration(500)
      .call(this.xAxis)
    this.svg.selectAll(".g-axis-x-line").transition()
      .delay(200)
      .duration(500)
      .call(this.xAxisLine).selectAll("line")
      .attr("stroke", "#777")
  }

  groupAdd() {
    const self = this;
    this.rectBars
      .transition()
      .delay((d, i) => i * 50)
      .duration(500)
      .ease(d3.easeQuadOut)
      .attr('height', d => {
        var keyLength = this.chartState.keys.filter((k, i) => i % 2 === d[2] % 2 && k.active).length

        return keyLength ? (this.yScale.bandwidth() - this.paddingScale(this.rectPadding)) / keyLength : 0;
      })
      .attr('y', (d, i) => {
        var keyLengthIndex = this.chartState.keys.filter((k, i) => i % 2 === d[2] % 2 && k.active).length;

        return this.yScale(i) + this.paddingScale(this.rectPadding) / 2 +
          (keyLengthIndex ?
            (this.yScale.bandwidth() - this.paddingScale(this.rectPadding)) /
            (this.chartState.keys.filter((k, i) => i % 2 === d[2] % 2 && k.active).length) *
            (Math.floor(d[2] / 2) - this.chartState.keys.filter((k, i) => i % 2 === d[2] % 2 && !k.active && i < d[2]).length) : 0)
      })
      .transition()
      .call(this.endAll, this.transitionCallBack, self)
      .attr('x', (d, i) => { return d[3][d[2]] >= 0 ? this.xScale(0) : this.xScale(d[3][d[2]]) })
      .attr('width', d => { return this.xScale(d[1]) - this.xScale(d[0]) })
  }

  groupRemove() {
    const self = this;
    this.rectBars
      .transition()
      .delay((d, i) => i * 50)
      .duration(500)
      .ease(d3.easeQuadOut)
      .attr('x', (d, i) => { return d[3][d[2]] >= 0 ? this.xScale(0) : this.xScale(d[3][d[2]]) })
      .attr('width', d => { return this.xScale(d[1]) - this.xScale(d[0]) })
      .transition()
      .call(this.endAll, this.transitionCallBack, self)
      .attr('height', d => {
        var keyLength = this.chartState.keys.filter((k, i) => i % 2 === d[2] % 2 && k.active).length

        return keyLength ? (this.yScale.bandwidth() - this.paddingScale(this.rectPadding)) / keyLength : 0;
      })
      .attr('y', (d, i) => {
        var keyLengthIndex = this.chartState.keys.filter((k, i) => i % 2 === d[2] % 2 && k.active).length;

        return this.yScale(i) + this.paddingScale(this.rectPadding) / 2 +
          (keyLengthIndex ?
            (this.yScale.bandwidth() - this.paddingScale(this.rectPadding)) /
            (this.chartState.keys.filter((k, i) => i % 2 === d[2] % 2 && k.active).length) *
            (Math.floor(d[2] / 2) - this.chartState.keys.filter((k, i) => i % 2 === d[2] % 2 && !k.active && i < d[2]).length) : 0)
      })

  }


  percent() {
    this.yScale.domain([0, 1])

    this.rectBars
      .transition()
      .delay((d, i) => i * 50)
      .duration(500)
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
      .attr('width', this.xScale.bandwidth() - this.paddingScale(this.rectPadding))
      .attr('x', (d, i) => this.xScale(i) + this.paddingScale(this.rectPadding) / 2)
      .selectAll('title')
      .text((d, i) => {
        var total = d3.sum(d[3]);
        var percent = Math.round((d[1] - d[0]) / total * 100);
        // console.log(d, total)
        return `Percent: ${percent}% \nMonth: ${this.reportData[i].month}`
      })


    this.yAxis.tickFormat(this.formatPercent)

    this.svg.selectAll(".g-axis-y").transition()
      .delay(200)
      .duration(500)
      .call(this.yAxis)
    this.svg.selectAll(".g-axis-y-line").transition()
      .delay(200)
      .duration(500)
      .call(this.xAxisLine).selectAll("line")
      .attr("stroke", "#777")
  }

  clearChart() {
    this.svg.selectAll("g")
      .remove()
      .exit()
  }

  initData() {
    this.isFilterExists = !!this.retrieveFilters();
    const timespan = this.isFilterExists ? this.retrieveFilters().timeSpan : {};

    this.service.getReportFinancial({ ...timespan });
    return;
    // this.getMonths();
    /** @TODO Raw data from DB */
    // this.rawData = d3
    //   .range(this.chartState.keys.length)
    //   .map((key, i) => bumps(this.months.length).map(d => i % 2 === 0 ? -d : d));

    // this.colors = d3.scaleOrdinal(['#fed976', '#d9f0a3', '#fd8d3c', '#78c679', '#e31a1c', '#41ab5d', '#b10026', '#005a32'])
    //   .domain([0, this.chartState.keys.length - 7]);

    // this.dataMock = this.months.map((m, i) => {
    //   var object = { 'month': m }
    //   this.chartState.keys.forEach((key, index) => object[key.name] = this.rawData[index][i])
    //   return object;
    // });
    // console.log("DEBUG_DATAMOCK", this.dataMock)
    // this.dataSet = d3.range(this.chartState.keys.length).map((key, i) => bumps(this.month.length).map(d => i % 2 === 0 ? -d : d));
    // console.log(this.dataSet)

    // this.colors = d3.scaleOrdinal(['#fed976', '#d9f0a3', '#fd8d3c', '#78c679', '#e31a1c', '#41ab5d', '#b10026', '#005a32'])
    //   .domain([0, this.chartState.keys.length - 7])

    // this.dataMock = this.month.map((m, i) => {
    //   return { 'month': m, 'value': this.dataSet[0][i], 'value1': this.dataSet[1][i], 'value2': this.dataSet[2][i], 'value3': this.dataSet[3][i], 'value4': this.dataSet[4][i], 'value5': this.dataSet[5][i], 'value6': this.dataSet[6][i], 'value7': this.dataSet[7][i] }
    // })

  }

  initState() {
    this.reportChanged$ = this.service.reportFinancialReady.subscribe((reports: ReportFinancial[]) => {
      this.onReportChanged(reports)
    });

    this.service.windowResized.subscribe(() => this.onResize());

    this.colors = d3.scaleOrdinal(['#fed976', '#d9f0a3', '#fd8d3c', '#78c679', '#e31a1c', '#41ab5d', '#b10026', '#005a32']);
  }

  onReportChanged(reports: ReportFinancial[]) {
    reports.forEach((report: ReportFinancial) => report.month = report.month.slice(0, 10));
    this.reportData = reports;

    if (this.reportData.length === 0)
      return;

    if (this.isFilterExists && this.retrieveFilters().keys) {
      const keysParams = this.retrieveFilters().keys;
      this.chartState.keys = keysParams;
      this.chartState.activeKeyCountPrevPositive = this.retrieveFilters().activeKeyCountPrevPositive;
      this.chartState.activeKeyCountPrevNegative = this.retrieveFilters().activeKeyCountPrevNegative;
    } else {
      const keys = this.objectKeys(this.reportData[0])
      /** @Important only take variance sum into chart*/
      .filter(key => key !== 'month' && key.split('_')[3] !== 'Count');

      this.chartState.keys = keys.map(key => {
        return { 'name': key, 'active': true, offset: key.substring(0, 1) === 'o' ? 'positive' : 'negative' }
      });

    }

    // this.chartState.keys = keys.map(key => {
    //   return { 'name': key, 'active': true, offset: key.substring(0, 1) === 'o' ? 'positive' : 'negative' }
    // });

    if (this.isFilterExists && this.retrieveFilters().schemaActive) {
      this.chartState.schemaActive = this.retrieveFilters().schemaActive;
    }

    this.groupMonths();
    this.clearSelection();
    this.masterToggle();
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
    this.filterdData = this.reportData
      .map((d, i) => {
        var obj = { ...d };
        this.chartState.keys.forEach(key => {
          obj[key.name] = key.active ? obj[key.name] : 0
        })
        return obj;
      })
      .filter((d: ReportFinancial, i) => this.selection.selected.includes(d.month))


    // start, end,  index, [value1, value2, ..... valueN]
    this.stackedData = d3.stack()
      .keys(this.chartState.keys.map(key => key.name))
      .offset(d3.stackOffsetDiverging)(this.filterdData)
      .map((d, i) =>
        d.map(data => {
          // console.log(data)
          var array = this.chartState.keys.map(key => data.data[key.name]);
          data.push(i);
          data.push(array);
          data.key = d.key;
          return data;
        })
      );

    this.maxGrouped = d3.max(this.stackedData[0].map(d => d[3]), y => d3.max(y))
    this.maxStacked = d3.max(this.stackedData, y => d3.max(y, d => d[1]))

    this.minGrouped = d3.min(this.stackedData[0].map(d => d[3]), y => d3.min(y))
    this.minStacked = d3.min(this.stackedData, y => d3.min(y, d => d[0]))
  }

  updateCategory() {

    this.updateData();
    // var datasetRemove = this.dataSet.map((d, i) => !this.chartState.keys[i].active ? d.map(d => 0) : d);

    // this.testData = d3.stack()
    //   .keys(d3.range(this.chartState.keys.length))
    //   .offset(d3.stackOffsetDiverging)
    //   (d3.transpose(datasetRemove))
    //   .map((d, i) => d.map(data =>
    //     // start, end,  index, [value1, value2, ..... valueN]
    //     [data[0], data[1], i, data.data])
    //   );

    // console.log(this.testData)
    // this.maxGrouped = d3.max(this.testData[0].map(d => d[3]), y => d3.max(y))
    // this.maxStacked = d3.max(this.testData, y => d3.max(y, d => d[1]))

    // this.minGrouped = d3.min(this.testData[0].map(d => d[3]), y => d3.min(y))
    // this.minStacked = d3.min(this.testData, y => d3.min(y, d => d[0]))

    this.svg
      .selectAll('.g-stack')
      // .data(this.testData)
      .data(this.stackedData)
      .selectAll('rect')
      .data(d => d)
      .selectAll('title')
      .data((d, i) => {
        // console.log(d, i);
        // console.log('title', d, i);
        return d[3][d[2]]
      })

    // this.rectBars.select('title')
    //   .attr('d', (d, i) => {
    //     // console.log(d, i);
    //     //  console.log('title', d, d[3][d[2]]); 
    //     return d
    //   })
    //   .text((d, i) => {
    //     return `Count: ${d[3][d[2]]} of ${d3.sum(d[3])} 
    //     Month: ${    this.dataMock[i].month}`
    //   })

    this.onRemoveEffect();
    this.updateLegend();
    this.updateChart();


    // console.log(this.svg.selectAll('.g-stack').selectAll('rect').selectAll('title'))


    // if (this.schema === 'grouped') {
    //   this.grouped();
    // } else if (this.schema === 'percent') {
    //   this.percent();
    // } else {
    //   this.stacked();
    // }

    this.chartState.activeKeyCountPrevPositive = d3.sum(this.chartState.keys.map((k, i) => k.active && k.offset === 'positive' ? 1 : 0))
    this.chartState.activeKeyCountPrevNegative = d3.sum(this.chartState.keys.map((k, i) => k.active && k.offset === 'negative' ? 1 : 0))
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
        .attr('y', (d, i) => {
          var keyLengthIndex = this.chartState.keys.filter((k, i) => i % 2 === d[2] % 2 && k.active).length;

          return this.yScale(i) + this.paddingScale(this.rectPadding) / 2 +
            (keyLengthIndex ?
              (this.yScale.bandwidth() - this.paddingScale(this.rectPadding)) /
              (this.chartState.keys.filter((k, i) => i % 2 === d[2] % 2 && k.active).length) *
              (Math.floor(d[2] / 2) - this.chartState.keys.filter((k, i) => i % 2 === d[2] % 2 && !k.active && i < d[2]).length) : 0)
        })
    } else {
      this.rectBars.transition()
        .duration(500)
        // .delay((d, i) => i * 25)
        .attr('y', (d, i) => this.yScale(i) + this.paddingScale(this.rectPadding) / 2)
    }

    this.svg.select('.axis-y').selectAll(".tick")
      .transition()
      .duration(500)
      .attr("transform", (d, i) => `translate(${0}, ${this.yScale(i) + this.yScale.bandwidth() / 2})`)
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
    // // console.log($e)
    // this.schema = $e.value;

    // if (this.schema === 'grouped') {
    //   this.grouped();
    // } else if (this.schema === 'percent') {
    //   this.percent();
    // } else {
    //   this.stacked();
    // }

    this.onRemoveEffect();
    this.updateChart();

  }

  isCategoryDisable(key) {
    var condition = this.chartState.keys.filter(k => k.active).length <= 1;
    var condition2 = key.active;

    return condition && condition2;
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

    // const btn = [{
    //   Name: 'Export',
    //   Icon: 'export data',
    //   Description: "Download as CSV"

    // }, {
    //   Name: 'Redirect',
    //   Icon: 'export data',
    //   Description: "Download as CSV"
    // }]


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
      .style('padding', '0px 6px')
      .style('font-sisze', '12px')
      .style('margin-right', '6px')
      .text(d => d.Name)


    //

    this.tooltipDiv
      .append('section')
      .attr('id', 'tooltip-info')
      .style('padding', `6px 12px 12px 12px`)
      .style('border-radius', ` 0 0 6px 6px`)
      .style('position', 'relative')
      .style('background-color', `#fff`)
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

  displayTooltipDIV(data) {
    const clientRect = this.svg.node().getBoundingClientRect();

    const text = [
      { name: 'Description', value: data.key.split("_").join(" ") },
      { name: 'Month', value: data.data['month'] },
      { name: 'Count', value: data.data[data.key + '_Count'] },
      { name: 'Sum', value: this.service.currencyConverter(data.data[data.key]) },
      { name: 'Net Total', value: this.service.currencyConverter((data[3] as number[]).reduce((prev, curr) => this.service.numberadd(prev, curr))) },
      // { name: 'Percent', value: `${Math.round(data.data[data.key] / d3.sum(data[3]) * 100)}%` },
    ]

    this.tooltipDiv
      .style('display', 'block')
      .style('opacity', () => this.chartState.rectActive.selected ? 1 : 0.9)
      .style('left', `${d3.event.pageX - clientRect.x + 30}px`)
      .style('top', `${d3.event.pageY - clientRect.y + 30}px`)
      // .transition()
      .selectAll('div')
      .data(text);

    this.tooltipDiv
      .select('#tooltip-info')
      .selectAll('div')
      .data(text)
      .selectAll('span')
      .data(d => Object.entries(d))
      .text(d => d[1]);

    this.tooltipDiv
      .select('#tooltip-action')
      .selectAll('button')
      .data(this.btns)
      .on('click', d => d.onClick(data));
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
    this.service.getReportFinancial(e);
  }

  onSaveFilters() {

    let chartStateParams = {
      schemaActive: this.chartState.schemaActive,
      keys: this.chartState.keys,
      activeKeyCountPrevNegative: this.chartState.activeKeyCountPrevNegative,
      activeKeyCountPrevPositive: this.chartState.activeKeyCountPrevPositive,
      timeSpan: this.chartState.timeSpanApplied,
      monthSelected: this.selection.selected
    };
    localStorage.setItem('report_financial', JSON.stringify(chartStateParams));

    // this.openSnackBar('Filters Saved', 'Dismiss');
  }

  retrieveFilters() {
    if (!localStorage.getItem('report_financial'))
      return null;

    const chartStateParams = JSON.parse(localStorage.getItem('report_financial'));
    return chartStateParams;
  }

  download_csv() {
    const report = this.filterdData;
    const FILENAME = `Revrec2Discrepancies_Financial_${moment().format('MMM_DD_YYYY_hhmmA')}.csv`;
    this.service.downloadTest(report, FILENAME);
  }

  onRefresh() {
    this.service.getReportFinancial(this.chartState.timeSpanFetched);
  }

  onSort() {
    if (this.chartState.transitioning)
      return;

    if (this.chartState.sorted = !this.chartState.sorted) {
      this.chartState.yindex = d3.range(this.filterdData.length).sort((a, b) => {
        var diff = d3.sum(this.chartState.keys.map(d => this.filterdData[a][d.name]))
          - d3.sum(this.chartState.keys.map(d => this.filterdData[b][d.name]))
        return diff
      });
    } else {
      this.chartState.yindex = d3.range(this.filterdData.length)
    }

    this.yScale
      .domain(this.chartState.yindex);

    this.onRemoveEffect();
    this.transitionSort();
  }


  onExportDiscrepancy(rect: any) {
    const keys = rect.key.split('_');
    const month = rect.data.month;
    const isOverPay = keys[0];
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
      includeResolved: true,
      varianceSign: isOverPay === 'overpay' ? 'positive' : 'negative'
    }
    // console.log(filters, discrepancyStatuses, this.settingService.getOptions('discrepancyStatus'))
    var report$ = this.sharedService.getDiscrepancyReport({}, filters)
      .subscribe(result => {
        // console.log(result)
        // this.isReportDownloading = false;
        // console.log(" Get Discrepancy Report =>", result.data)
        // this.openSnackBar('Download Finished', 'Ok', 2);

        const FILENAME = `Revrec2Financial_${month}_${isOverPay}_${isEnrolled}_${isResolved}_${moment().format('MMM_DD_YYYY_hhmmA')}.csv`;
        this.service.downloadTest(result.data.list, FILENAME);
      });
  }


  onRedirectDiscrepancy(rect: any) {
    const keys = rect.key.split('_');
    const month = rect.data.month;
    const isOverPay = keys[0];
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
      includeResolved: true,
      varianceSign: isOverPay === 'overpay' ? 'positive' : 'negative'
    }
    const navData = {
      previousRoute: 'report/financial',
      nextRoute: 'discrepancies',
      data: filters
    };
    this.navService.onNav(navData);
    this.router.navigate(['/discrepancies']);

  }

}

// function downloadTest(report) {
//   const data = report;
//   const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
//   const header = Object.keys(data[0]);
//   let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
//   csv.unshift(header.join(','));
//   let csvArray = csv.join('\r\n');

//   var a = document.createElement('a');
//   var blob = new Blob([csvArray], { type: 'text/csv' }),
//     url = window.URL.createObjectURL(blob);

//   a.href = url;
//   a.download = "myFile.csv";
//   a.click();
//   window.URL.revokeObjectURL(url);
//   a.remove();
// }

// function bumps(m) {
//   const values = [];

//   for (let i = 0; i < m; ++i) {
//     values[i] = Math.floor(1000 + 1000 * Math.random());
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

