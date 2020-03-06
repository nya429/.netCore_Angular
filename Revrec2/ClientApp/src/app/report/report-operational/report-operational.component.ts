import { filter } from 'rxjs/operators';
import { ReportService } from './../report.service';
import { Component, OnInit, ElementRef, ViewChild, Input, HostListener } from '@angular/core';
import { transition } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import * as d3 from 'd3';
import * as d3Chromatic from 'd3-scale-chromatic';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-report-operational',
  templateUrl: './report-operational.component.html',
  styleUrls: ['./report-operational.component.css']
})
export class ReportOperationalComponent implements OnInit {
  @ViewChild('BarChart') private chartContainer: ElementRef;
  @ViewChild('Report') private reportContainer: ElementRef;

  @Input() private data: Array<any>;


  svg;
  element;
  element2;


  dataMock;
  filterdDataMock;
  monthStr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  private sorted = false;
  private month = [];
  private key = 4;

  private activeKeys = [];
  private activeMonth = [];


  private resizeTimer;
  private rawData;
  private stackedData;

  selection = new SelectionModel<string>(true, []);


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

  private schema: string = 'stacked';

  public searchForm: FormGroup;
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
    }
  }

  constructor(private fb: FormBuilder,
    private service: ReportService) {
    this.initData();

  }

  ngOnInit() {
    this.masterToggle();
    this.element = this.chartContainer.nativeElement;
    this.element2 = this.reportContainer.nativeElement;
    this.initForm();
    this.updateData();

    setTimeout(() => {
      this.updateBase()
      this.updateScale();
      this.initLegend();
      this.initChart();
      this.service.windowResized.subscribe(() => this.onResize());
    }, 400);
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

  getMonths() {
    // Revrec2 file processing back to 2018-01-01
    const monthStart = '2018-01-01';

    const e = new Date(Date.parse(monthStart));
    const eMonth = e.getUTCMonth() + 1;
    const eYear = e.getFullYear() + 1;

    const current = new Date();
    const currentMonth = current.getUTCMonth() + 1;
    const currentYear = current.getFullYear();

    let months = [];
    // for (let year = currentYear; year > eYear; year--) {
    for (let year = eYear; year <= currentYear; year++) {
      for (let month = 1; month <= 12; month++) {
        if (year === currentYear && month > currentMonth) {
          break;
        } else if (year !== currentYear || (year === currentYear && month <= currentMonth)) {
          const mon = `${year}-${month > 9 ? month : "0" + month}-01`;
          months.push(mon);
        }
      }
    }
    return months;
  }

  updateBase() {
    this.width = this.element.offsetWidth - this.margin.left - this.margin.right;
    this.height = this.element2.offsetHeight - this.margin.top - this.margin.bottom;


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
    const data = this.chartState.keys


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
        var len = data.filter((d, index) => i > index && d.active).reduce((acc, cur) => acc + cur.name.length, 0);
        return `translate(${- len * fontSize * 0.7 - size * (i + 1.4)}, ${this.padding.top / 3})`;
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
    const data = this.chartState.keys

    this.legend = this.svg
      .select('.g-legend')
      .selectAll(".legend")
      .data(data)
      .transition()
      .attr('opacity', (d, i) => d.active ? 1 : 0)
      .attr('transform', (d, i) => {
        var len = data.filter((d, index) => i > index && d.active).reduce((acc, cur) => acc + cur.name.length, 0);
        return `translate(${- len * fontSize * 0.7 - size * (i + 1.4)}, ${this.padding.top / 3})`;
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
        const node = nodes[i]

        if (this.chartState.transitioning) {
          return;
        }
        this.onRectMouseClick(node)
        this.displayTooltipDIV(d)
      })

    // this.svg.on('click', () => {


    //   this.chart
    // })



    this.initToolTipDIV();
  }

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement) {
    console.log(targetElement, this.rectBars.nodes(), this.tooltipDiv)

    if (!this.chartState.rectActive.selected) return;

    const clickedInside = this.tooltipDiv.nodes() === targetElement ;

    console.log(clickedInside);
    if (!clickedInside) {
      this.onRemoveEffect();
    }
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

  appendtext() {
    /**
     * Bar Text
     */
    const texts = this.svg.append('g')
      .attr('class', 'g-bar-text')
      .selectAll('.bar-text')
      .data(this.dataMock.map(d => d.value))
      .enter()
      .append('text')
      .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`)
      .attr('x', (d, i) => this.xScale(i))
      .attr('y', d => this.yScale(0) + this.padding.top)
      .attr('dx', d => this.xScale.bandwidth() / 2 - 16)
      .attr('dy', d => 0)
      .text(d => d)
      .attr('fill', 'rgb(78, 121, 167, 0)')
      .transition()
      .attr('fill', 'white')
      .delay((d, i) => i * 50)
      .duration(500)
      .ease(d3.easeQuadOut)
      .attr('y', d => this.yScale(d) + this.padding.top)
      .attr('height', d => this.height - this.padding.top - this.padding.bottom - this.yScale(d));
  }

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
    /** @TODO Raw Month
     *  this should get from RawData extract from Rawdata
     */
    this.month = this.getMonths();
    /** @TODO Raw data from DB */
    this.rawData = d3
      .range(this.chartState.keys.length)
      .map(() => bumps(this.month.length));

    this.colors = d3.scaleOrdinal(['#98b8c7', '#6f9bb0', '#31708e', '#81BEB0', '#D4EAD9'])
      .domain([0, this.chartState.keys.length])

    /** @TODO 
     *  this should be the mock data converted from rawData used by Chart
     *  dataMock should not be changed
     */
    this.dataMock = this.month.map((m, i) => {
      var object = { 'month': m }
      this.chartState.keys.forEach((key, index) => object[key.name] = this.rawData[index][i])
      return object;
    })

    console.log("DEBUG_DATAMOCK", this.dataMock)
    // var test2 = d3.stack().keys(this.chartState.keys.map(key => key.name))(this.dataMock)

    // // console.log(test2);
    // var test3 = test2
    //   .map((d, i) => d.map(data =>
    //     // start, end,  index, [value1, value2, ..... valueN]
    //     [data[0], data[1], d.key, data.data])
    //   );
    // console.log(test3)
  }

  updateData(m?) {
    /**
     * Manipulate Data based on ChartState.Key
     * IF Key.active == false
     * Then value = 0 
     */
    // var dataset = this.rawData
    //   .map((d, i) =>
    //     this.chartState.keys[i].active ? d : d.map(d => 0))
    //   /**
    //   * Manipulate Data based on Month Selection
    //   * Exclude the month not been selected
    //   */
    //   .map(x => x.filter((y, i) =>
    //     /** @TODO Change way to exclude month 
    //      *  Current exclude this? 
    //      */
    //     this.selection.selected.includes(this.month[i]))
    //     // this.dataMock.map(m => m.month).includes(this.month[i]))
    //   );

    this.filterdDataMock = this.dataMock
      .map((d, i) => {
        var obj = { ...d };
        this.chartState.keys.forEach(key => {
          obj[key.name] = key.active ? obj[key.name] : 0
        })
        return obj;
      })
      .filter((d, i) => this.selection.selected.includes(d.month))


    // start, end,  index, [value1, value2, ..... valueN]
    this.stackedData = d3.stack()
      .keys(this.chartState.keys.map(key => key.name))(this.filterdDataMock)
      .map((d, i) => d.map(data => {
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
        // console.log(d, i);
        // console.log('title', d, i);
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

  testSort() {
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

  /** @Output */
  onMonthSelect(month: string) {
    this.selection.toggle(month);
    this.selection.sort((a, b) => Date.parse(a) - Date.parse(b));

    // this.dataMock = this.selection.selected.map((m, i) => {
    //   return { 'month': m, 'value': this.rawData[0][this.month.indexOf(m)], 'value1': this.rawData[1][this.month.indexOf(m)], 'value2': this.rawData[2][this.month.indexOf(m)], 'value3': this.rawData[3][this.month.indexOf(m)] }
    // })
    // console.log(this.dataMock)

    this.updateData(month);

    this.clearChart();
    this.onRemoveEffect();
    this.updateScale();
    this.initLegend();
    this.initChart();
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.month.forEach(month => this.selection.select(month));

    this.selection.sort((a, b) => Date.parse(a) - Date.parse(b));

    // this.dataMock = this.selection.selected.map((m, i) => {
    //   return { 'month': m, 'value': this.rawData[0][this.month.indexOf(m)], 'value1': this.rawData[1][this.month.indexOf(m)], 'value2': this.rawData[2][this.month.indexOf(m)], 'value3': this.rawData[3][this.month.indexOf(m)] }
    // })

    if (this.svg) {
      this.updateData();
      this.clearChart();
      this.onRemoveEffect();
      this.updateScale();
      this.initLegend();
      this.initChart();
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.month.length;
    return numSelected == numRows;
  }

  onRadioClicked($e) {
    this.onRemoveEffect();
    this.updateChart();
  }

  isCategoryDisable(key) {
    var condition = this.chartState.keys.filter(k => k.active).length <= 1;
    var condition2 = key.active;

    return condition && condition2;
  }

  initForm() {
    this.searchForm = this.fb.group({
      startDate: '',
      endDate: '',
    }, {
        validator: this.dateInputValidator
      });
  }

  dateInputValidator(form: FormGroup) {
    const condition = form.get('startDate').getError('matDatepickerParse') || form.get('endDate').getError('matDatepickerParse')
    return condition ? { dateInputError: true } : null;
  }

  fireWhenEmpty(el, formControlName: string): void {
    if (!el.value || el.value === '') {
      this.searchForm.patchValue({ [formControlName]: '' }, { emitEvent: true })
    }
  }

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
      .style('background-color', `#fff`)
      .style('border-radius', `6px`)
      .style('padding', `12px`)

    this.tooltipDiv
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
      { name: 'Description', value: data.key },
      { name: 'Month', value: data.data['month'] },
      { name: 'Count', value: data.data[data.key] },
      { name: 'Total', value: d3.sum(data[3]) },
      { name: 'Percent', value: `${Math.round(data.data[data.key] / d3.sum(data[3]) * 100)}%` },
    ]

    this.tooltipDiv
      .style('opacity', () => this.chartState.rectActive.selected ? 1 : 0.9)
      .style('left', `${d3.event.pageX - clientRect.x + 30}px`)
      .style('top', `${d3.event.pageY - clientRect.y + 30}px`)
      // .transition()
      .selectAll('div')
      .data(text)

    this.tooltipDiv
      .selectAll('div')
      .data(text)
      .selectAll('span')
      .data(d => Object.entries(d))
      .text(d => d[1])
  }

  hideTooltipDIV() {
    if (!this.tooltipDiv) return;
    this.tooltipDiv.style('opacity', 0)
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
    self.chartState.transitioning = transitioning;
  }

  download_csv() {
    const report = this.filterdDataMock;
    downloadTest(report);
  }
}

function downloadTest(report) {
  const data = report;
  const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
  const header = Object.keys(data[0]);
  let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
  csv.unshift(header.join(','));
  let csvArray = csv.join('\r\n');

  var a = document.createElement('a');
  var blob = new Blob([csvArray], { type: 'text/csv' }),
    url = window.URL.createObjectURL(blob);

  a.href = url;
  a.download = "myFile.csv";
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}


function bumps(m) {
  const values = [];

  for (let i = 0; i < m; ++i) {
    values[i] = Math.floor(500 + 1000 * Math.random());
  }

  // Add five random bumps.
  for (let j = 0; j < 4; ++j) {
    const x = 1 / (1 + Math.random());
    const y = 1 * Math.random() - 0.5;
    const z = 10 / (1 + Math.random());
    for (let i = 0; i < m; i++) {
      const w = (i / m - y) * z;
      values[i] += Math.floor(x * Math.exp(-w * w));
    }
  }

  // Ensure all values are positive.
  for (let i = 0; i < m; ++i) {
    values[i] = Math.max(0, values[i]);
  }

  return values;
}

