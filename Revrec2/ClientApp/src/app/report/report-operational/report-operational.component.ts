import { ReportService } from './../report.service';
import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
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
  dataset = [1600, 1633, 1711, 1688, 1664, 1850, 1764, 1950, 1942, 2220, 2510, 2400, 2320, 3010, 3310, 3825, 4100, 3900, 4231, 4431, 4679, 4901, 4320, 4570, 5100, 4930];
  dataset2 = [600, 633, 711, 688, 664, 850, 764, 950, 942, 220, 510, 400, 320, 10, 310, 825, 100, 900, 231, 431, 679, 901, 420, 570, 100, 930];
  dataset3 = [260, 363, 471, 568, 664, 780, 574, 490, 392, 220, 250, 540, 620, 710, 830, 1185, 1410, 1390, 1421, 1431, 1469, 1491, 1430, 1457, 1500, 1430];
  monthStr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  private month = [];
  private key = 4;

  private activeKeys = [];
  private activeMonth = [];


  private resizeTimer;
  private dataSet;
  private testData;

  selection = new SelectionModel<string>(true, []);


  private margin: any = { top: 90, bottom: 20, left: 20, right: 20 };
  private padding = { left: 108, right: 36, top: 48, bottom: 144 };
  private rectHeight = 25;
  private rectPadding = 1.5;

  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private linear: any;
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

  private schema: string = 'stacked';

  public searchForm: FormGroup;
  public chartState = {
    schemaActive: 'Stacked',
    schemaOptions: ['Stacked', 'Percent', 'Grouped'],
    keys: [{ name: 'Member resolved', active: true },
    { name: 'Member unresolved', active: true },
    { name: 'Non-member resolved', active: true },
    { name: 'Non-member unresolved', active: true }],
    // @TODO Should configurble
    activeKeyCountPrev: 4,
  }

  constructor(private fb: FormBuilder,
    private service: ReportService) {
    this.initData();
    this.updateData();
  }

  ngOnInit() {
    this.element = this.chartContainer.nativeElement;
    this.element2 = this.reportContainer.nativeElement;
    this.masterToggle();

    this.initForm();

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
      this.clearChart();
      this.updateBase()
      this.updateScale();
      this.initLegend();
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
    this.height = this.height <= 0 ? 624 : this.height;
    // console.log(element.clientWidth, element.clientHeight, element2.clientHeight)
    if (!this.svg) {
      this.svg = d3.select(this.element).append('svg')
    }
    this.svg
      .attr('width', this.width)
      .attr('height', this.height);
  }

  updateScale() {
    this.linear = d3.scaleLinear()
      .domain([0, d3.max(this.dataMock.map(d => d.value))])
      .range([0, 250]);

    // month related 
    this.xScale = d3.scaleBand()
      .domain(d3.range(this.dataMock.length))
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
        this.dataMock[i].month
        // ))
      );

    this.yAxis = d3.axisLeft(this.yScale).tickArguments([10, 's']);

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
      .text((d, i) => this.monthStr[new Date(Date.parse(this.dataMock[i].month)).getUTCMonth()])
      // .enter()
      .append('tspan')
      .attr('x', 0)
      .attr('dx', "-.5em")
      .attr('dy', '1.5em')
      .text((d, i) => new Date(Date.parse(this.dataMock[i].month)).getUTCFullYear())

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


    // this.rectBars = this.svg.append('g')
    //   .attr('class', 'g-bar')
    //   .selectAll('rect')
    //   .data(this.dataMock.map(d => d.value))
    //   .enter()
    //   .append('rect');

    this.rectBars = this.svg.append('g')
      .attr('class', 'g-test-data')
      .selectAll('g')
      .data(this.testData)
      .enter()
      .append('g')
      .attr('class', 'g-stack')
      .attr('id', (d, i) => this.chartState.keys[i].name)
      .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`)
      .attr('fill', (d, i) => this.colors(i))
      // .attr('fill', 'red')
      .selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('d', d => d[3][d[2]])

    this.rectBars
      // .selectAll('title')
      // .data((d, i) => {
      //   console.log(d, i);
      //   return d;
      // })
      // .enter()
      .append('title')
      .attr('d', (d, i) => {
        // console.log(d, i);
        return d[3][d[2]];
      })
      .text((d, i) => {
        // console.log(d, i);
        return `Count: ${d[3][d[2]]} of ${d3.sum(d[3])} 
        Month: ${    this.dataMock[i].month}`
      })

    this.rectBars
      .attr('x', (d, i) => this.xScale(i) + this.paddingScale(this.rectPadding) / 2)
      .attr('y', d => this.yScale(0))
      .attr('width', this.xScale.bandwidth() - this.paddingScale(this.rectPadding))
      .attr('height', d => 0)

    this.updateChart();
    // .each('end', function() {
    //   self.rectBars.on('mouseover', function (d, i) {
    //     const bar = d3.select(this);

    //     bar.transition()
    //       .duration(200)
    //       .attr('fill', 'red')
    //       .attr('cursor', 'pointer')
    //       .ease(d3.easeQuadOut)
    //   })
    //     .on('mouseout', function (d, i) {
    //       const bar = d3.select(this);

    //       bar.transition()
    //         .duration(200)
    //         .attr('fill', 'green')
    //         .ease(d3.easeQuadOut)
    //     })
    // })
    ;

    /**
     * Bar Text
     * 
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
*/
  }

  stacked() {
    this.yScale.domain([0, this.maxStacked])

    this.rectBars
      .transition()
      .delay((d, i) => i * 50)
      .duration(500)
      .ease(d3.easeQuadOut)
      .attr('y', d => this.yScale(d[1]))
      .attr('height', d => this.height - this.padding.top - this.padding.bottom - this.yScale(d[1] - d[0]))
      .transition()
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

    this.rectBars.select('title')
      .attr('d', (d, i) => {

        return d
      })
      .text((d, i) => {
        return `Count: ${d[3][d[2]]} of ${d3.sum(d[3])} 
        Month: ${    this.dataMock[i].month}`
      })

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

    this.rectBars.select('title')
      .attr('d', (d, i) => {
        // console.log(d, i);
        //  console.log('title', d, d[3][d[2]]); 
        return d
      })
      .text((d, i) => {
        return `Count: ${d[3][d[2]]} of ${d3.sum(d[3])} 
        Month: ${    this.dataMock[i].month}`
      })
  }

  groupAdd(activedKeyCount) {
    this.rectBars
      .transition()
      .delay((d, i) => i * 25)
      .duration(250)
      .ease(d3.easeQuadOut)
      .attr('width', d => (this.xScale.bandwidth() - this.paddingScale(this.rectPadding)) / activedKeyCount
        //  - this.paddingScale(this.rectPadding) * (d[2] === 0 ?  1 : 0) 
      )
      .attr('x', (d, i) => this.xScale(i) + this.paddingScale(this.rectPadding) / 2 + (this.xScale.bandwidth() - this.paddingScale(this.rectPadding)) / activedKeyCount * (
        d3.sum(this.chartState.keys.map(key => key.active).filter((key, index) => index < d[2]))
      ))
      .transition()
      .attr('y', d => this.yScale(d[1] - d[0]))
      .attr('height', d => this.height - this.padding.top - this.padding.bottom - this.yScale(d[1] - d[0]))
  }

  groupRemove(activedKeyCount) {
    this.rectBars
      .transition()
      .delay((d, i) => i * 25)
      .duration(250)
      .ease(d3.easeQuadOut)

      .attr('y', d => this.yScale(d[1] - d[0]))
      .attr('height', d => this.height - this.padding.top - this.padding.bottom - this.yScale(d[1] - d[0]))
      .transition()
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
      .delay((d, i) => i * 25)
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
      .selectAll('title')
      .text((d, i) => {
        var total = d3.sum(d[3]);
        var percent = Math.round((d[1] - d[0]) / total * 100);
        // console.log(d, total)
        return `Percent: ${percent}% \nMonth: ${this.dataMock[i].month}`
      })


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
    this.month = this.getMonths();
    this.dataSet = d3.range(this.chartState.keys.length).map(() => bumps(this.month.length));

    this.colors = d3.scaleOrdinal(['#98b8c7', '#6f9bb0', '#31708e', '#81BEB0', '#D4EAD9'])
      .domain([0, this.chartState.keys.length])

    this.dataMock = this.month.map((m, i) => {
      return { 'month': m, 'value': this.dataSet[0][i], 'value1': this.dataSet[1][i], 'value2': this.dataSet[2][i], 'value3': this.dataSet[3][i] }
    })

    console.log(this.dataMock)
  }

  updateData(m?) {

    var dataset = this.dataSet.map((d, i) => !this.chartState.keys[i].active ? d.map(d => 0) : d).map(x => x.filter((y, i) => this.dataMock.map(m => m.month).includes(this.month[i])));

    // console.log(dataset);
    this.testData = d3.stack()
      .keys(d3.range(this.chartState.keys.length))(d3.transpose(dataset))
      .map((d, i) => d.map(data =>
        // start, end,  index, [value1, value2, ..... valueN]
        [data[0], data[1], i, data.data])
      );

    this.maxGrouped = d3.max(this.testData[0].map(d => d[3]), y => d3.max(y))
    this.maxStacked = d3.max(this.testData, y => d3.max(y, d => d[1]))
  }

  updateCategory() {
    var datasetRemove = this.dataSet.map((d, i) => !this.chartState.keys[i].active ? d.map(d => 0) : d);

    this.testData = d3.stack()
      .keys(d3.range(this.chartState.keys.length))(d3.transpose(datasetRemove))
      .map((d, i) => d.map(data =>
        // start, end,  index, [value1, value2, ..... valueN]
        [data[0], data[1], i, data.data])
      );

    // console.log(this.testData)
    this.maxGrouped = d3.max(this.testData[0].map(d => d[3]), y => d3.max(y))
    this.maxStacked = d3.max(this.testData, y => d3.max(y, d => d[1]))

    this.svg
      .selectAll('.g-stack')
      .data(this.testData)
      .selectAll('rect')
      .data(d => d)
      .selectAll('title')
      .data((d, i) => {
        // console.log(d, i);
        // console.log('title', d, i);
        return d[3][d[2]]
      })

    this.rectBars.select('title')
      .attr('d', (d, i) => {
        // console.log(d, i);
        //  console.log('title', d, d[3][d[2]]); 
        return d
      })
      .text((d, i) => {
        return `Count: ${d[3][d[2]]} of ${d3.sum(d[3])} 
        Month: ${    this.dataMock[i].month}`
      })
    // console.log(this.svg.selectAll('.g-stack').selectAll('rect').selectAll('title'))


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

  /** @Output */
  onMonthSelect(month: string) {
    this.selection.toggle(month);
    this.selection.sort((a, b) => Date.parse(a) - Date.parse(b))
    this.dataMock = this.selection.selected.map((m, i) => {
      return { 'month': m, 'value': this.dataSet[0][this.month.indexOf(m)], 'value1': this.dataSet[1][this.month.indexOf(m)], 'value2': this.dataSet[2][this.month.indexOf(m)], 'value3': this.dataSet[3][this.month.indexOf(m)] }
    })


    this.updateData(month);

    this.clearChart();
    this.updateScale();
    this.initLegend();
    this.initChart();
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.month.forEach(month => this.selection.select(month));

    this.selection.sort((a, b) => Date.parse(a) - Date.parse(b))

    this.dataMock = this.selection.selected.map((m, i) => {
      return { 'month': m, 'value': this.dataSet[0][this.month.indexOf(m)], 'value1': this.dataSet[1][this.month.indexOf(m)], 'value2': this.dataSet[2][this.month.indexOf(m)], 'value3': this.dataSet[3][this.month.indexOf(m)] }
    })

    if (this.svg) {
      this.updateData();
      this.clearChart();
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
    // console.log($e)
    this.schema = $e.value;


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
}


function bumps(m) {
  const values = [];

  for (let i = 0; i < m; ++i) {
    values[i] = Math.floor(1000 + 1000 * Math.random());
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
