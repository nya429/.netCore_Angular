
import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { transition } from '@angular/animations';
import * as d3 from 'd3';
import * as d3Chromatic from 'd3-scale-chromatic';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-report-financial',
  templateUrl: './report-financial.component.html',
  styleUrls: ['./report-financial.component.css']
})
export class ReportFinancialComponent implements OnInit {
  @ViewChild('BarChart') private chartContainer: ElementRef;
  @ViewChild('Filter') private filterContainer: ElementRef;

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



  private dataSet;
  private testData;

  selection = new SelectionModel<string>(true, []);


  private margin: any = { top: 20, bottom: 20, left: 20, right: 20 };
  private padding = { left: 80, right: 80, top: 80, bottom: 80 };
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
  private minGrouped;
  private minStacked;

  private formatPercent = d3.format(".0%");
  private formatNumber = d3.format("$");


  private colors: any;
  private xAxisLine: any;
  private xAxis: any;
  private yAxis: any;
  private rectBars: any;

  private schema: string = 'stacked';

  private
  public chartState = {
    schema: 'stacked',
    keys: [
      { name: 'Underpay Member unresolved', active: true },
      { name: 'Overpay Member unresolved ', active: true },
      { name: 'Underpay Member resolved', active: true },
      { name: 'Overpay Member unresolved', active: true },
      { name: 'Underpay Non-member unresolved', active: true },
      { name: 'Overpay Non-member unresolved', active: true },
      { name: 'Underpay Non-member resolved', active: true },
      { name: 'Overpay Non-member resolved', active: true }],
    // these two need to be dynamic
    activeKeyCountPrevPostive: 4,
    activeKeyCountPrevNegtive: 4,
  }

  constructor() {
    this.initData();
    this.updateData();
  }

  ngOnInit() {
    this.element = this.chartContainer.nativeElement;
    this.element2 = this.filterContainer.nativeElement;
    this.masterToggle();

    setTimeout(() => {
      this.updateBase()
      this.updateScale();
      this.updateChart();
    }, 400);
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
    // console.log(element.clientWidth, element.clientHeight, element2.clientHeight)
    this.svg = d3.select(this.element).append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  updateScale() {
    this.linear = d3.scaleLinear()
      .domain([0, d3.max(this.dataMock.map(d => d.value))])
      .range([0, 250]);

    // month related 
    this.xScale = d3.scaleLinear()
      .domain([this.minStacked, this.maxStacked])
      .range([0, this.width - this.padding.left - this.padding.right]);

    //schema related
    this.yScale = d3.scaleBand()
      .domain(d3.range(this.dataMock.length))
      // .domain([0, d3.max(this.dataMock.map(d => d.value))])
      .range([0, this.height - this.padding.bottom - this.padding.top]);
  }

  updateChart() {
    const self = this;

    //schema related
    console.log(this.minStacked, this.maxStacked)
    this.xScale.domain([this.minStacked, this.maxStacked]);

    this.paddingScale = d3.scaleLinear()
      .domain([0, 5])
      .range([0, this.yScale.bandwidth() / 2]);


    this.yAxis = d3.axisLeft(this.yScale)
      .tickFormat((d, i) =>
        // d3.timeFormat("%B %Y")(Date.parse(
        this.dataMock[i].month
        // ))
      );

    this.xAxis = d3.axisBottom(this.xScale).tickArguments([20, 's']);

    this.xAxisLine = d3.axisBottom(this.xScale)
      .tickSize(this.height - this.padding.bottom - this.padding.top)
      .tickFormat('')


    const x = this.svg.append('g')
      .attr('class', 'g-axis-x')
      .attr('transform', `translate(${this.padding.left}, ${this.height - this.padding.bottom})`)
      .call(this.xAxis)


    const y = this.svg.append('g')
      .attr('class', 'g-axis-y')
      .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`)
      .call(this.yAxis)
    // .select(".g-axis-y")


    y.selectAll('text') // `text` has already been created
      .attr('text-anchor', 'end')
      .text((d, i) => this.monthStr[new Date(Date.parse(this.dataMock[i].month))
        .getUTCMonth()] 
        + " " + new Date(Date.parse(this.dataMock[i].month)).getUTCFullYear())
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
      .data(this.testData)
      .enter()
      .append('g')
      .attr('class', 'g-stack')
      .attr('id', (d, i) => this.chartState.keys[i].name)
      .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`)
      .attr('fill', (d, i) => { 
        // console.log(i, this.colors(i)); 
        return this.colors(i) })
      // .attr('fill', 'red')
      .selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('d', d => d)

    // this.rectBars
    //   // .selectAll('title')
    //   // .data((d, i) => {
    //   //   console.log(d, i);
    //   //   return d;
    //   // })
    //   // .enter()
    //   .append('title')
    //   .attr('d', (d, i) => {
    //     // console.log(d, i);
    //     return d[3][d[2]];
    //   })
    //   .text((d, i) => {
    //     // console.log(d, i);
    //     return `Count: ${d[3][d[2]]} of ${d3.sum(d[3])} 
    //     Month: ${    this.dataMock[i].month}`
    //   })


    this.rectBars
      .attr('x', (d, i) => this.xScale(0))
      .attr('y', (d, i) => this.yScale(i) + this.paddingScale(this.rectPadding) / 2)
      .attr('width', d => 0)
      .attr('height', this.yScale.bandwidth() - this.paddingScale(this.rectPadding))

    if (this.schema === 'grouped') {
      this.grouped();
    } else if (this.schema === 'percent') {
      this.percent();
    } else {
      this.stacked();
    }
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
    this.xScale.domain([this.minStacked, this.maxStacked])

    this.rectBars
      .transition()
      .delay((d, i) => i * 50)
      .duration(500)
      .ease(d3.easeQuadOut)
      .attr('x', d => { return this.xScale(d[0]) })
      .attr('width', d => { return this.xScale(d[1]) - this.xScale(d[0]) })
      .transition()
      .attr('height', this.yScale.bandwidth() - this.paddingScale(this.rectPadding))
      .attr('y', (d, i) => this.yScale(i) + this.paddingScale(this.rectPadding) / 2)

    this.xAxis.tickFormat(this.formatNumber)
    this.svg.selectAll(".g-axis-x").transition()
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
    var activedKeyCountPostive = d3.sum(this.chartState.keys.map((k, i) => k.active && (i % 2 === 1) ? 1 : 0))
    var activedKeyCountNegtive = d3.sum(this.chartState.keys.map((k, i) => k.active && (i % 2 === 0) ? 1 : 0))

    console.log(this.chartState.activeKeyCountPrevPostive, activedKeyCountPostive, this.chartState.activeKeyCountPrevNegtive, activedKeyCountNegtive)

    if (this.chartState.activeKeyCountPrevPostive < activedKeyCountPostive || this.chartState.activeKeyCountPrevNegtive < activedKeyCountNegtive || (this.chartState.activeKeyCountPrevPostive === activedKeyCountPostive && this.chartState.activeKeyCountPrevNegtive === activedKeyCountNegtive)) {
      this.groupAdd();
    } else {
      this.groupRemove();
      // this.groupRemove(activedKeyCount);
    }
    this.yAxis.tickFormat(this.formatNumber)
    this.svg.selectAll(".g-axis-x").transition()
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
      .attr('x', (d, i) => { return d[3][d[2]] >= 0 ? this.xScale(0) : this.xScale(d[3][d[2]]) })
      .attr('width', d => { return this.xScale(d[1]) - this.xScale(d[0]) })
  }

  groupRemove() {
    this.rectBars
      .transition()
      .delay((d, i) => i * 50)
      .duration(500)
      .ease(d3.easeQuadOut)
      .attr('x', (d, i) => { return d[3][d[2]] >= 0 ? this.xScale(0) : this.xScale(d[3][d[2]]) })
      .attr('width', d => { return this.xScale(d[1]) - this.xScale(d[0]) })
      .transition()
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
        return `Percent: ${percent}% \nMonth: ${this.dataMock[i].month}`
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
    this.month = this.getMonths();
    this.dataSet = d3.range(this.chartState.keys.length).map((key, i) => bumps(this.month.length).map(d => i % 2 === 0 ? -d : d));
    console.log(this.dataSet)

    this.colors = d3.scaleOrdinal(['#fed976', '#d9f0a3', '#fd8d3c', '#78c679', '#e31a1c', '#41ab5d', '#b10026', '#005a32'])
      .domain([0, this.chartState.keys.length - 7])

    this.dataMock = this.month.map((m, i) => {
      return { 'month': m, 'value': this.dataSet[0][i], 'value1': this.dataSet[1][i], 'value2': this.dataSet[2][i], 'value3': this.dataSet[3][i], 'value4': this.dataSet[4][i], 'value5': this.dataSet[5][i], 'value6': this.dataSet[6][i], 'value7': this.dataSet[7][i] }
    })

  }

  updateData(m?) {

    var dataset = this.dataSet.map((d, i) => !this.chartState.keys[i].active ? d.map(d => 0) : d).map(x => x.filter((y, i) => this.dataMock.map(m => m.month).includes(this.month[i])));



    this.testData = d3.stack()
      .keys(d3.range(this.chartState.keys.length))
      .offset(d3.stackOffsetDiverging)
      (d3.transpose(dataset))
      .map((d, i) => d.map(data =>
        // start, end,  index, [value1, value2, ..... valueN]
        [data[0], data[1], i, data.data])
      );
    console.log(this.testData);
    this.maxGrouped = d3.max(this.testData[0].map(d => d[3]), y => d3.max(y))
    this.maxStacked = d3.max(this.testData, y => d3.max(y, d => d[1]))

    this.minGrouped = d3.min(this.testData[0].map(d => d[3]), y => d3.min(y))
    this.minStacked = d3.min(this.testData, y => d3.min(y, d => d[0]))
  }

  updateCategory() {
    var datasetRemove = this.dataSet.map((d, i) => !this.chartState.keys[i].active ? d.map(d => 0) : d);

    this.testData = d3.stack()
      .keys(d3.range(this.chartState.keys.length))
      .offset(d3.stackOffsetDiverging)
      (d3.transpose(datasetRemove))
      .map((d, i) => d.map(data =>
        // start, end,  index, [value1, value2, ..... valueN]
        [data[0], data[1], i, data.data])
      );

    console.log(this.testData)
    this.maxGrouped = d3.max(this.testData[0].map(d => d[3]), y => d3.max(y))
    this.maxStacked = d3.max(this.testData, y => d3.max(y, d => d[1]))

    this.minGrouped = d3.min(this.testData[0].map(d => d[3]), y => d3.min(y))
    this.minStacked = d3.min(this.testData, y => d3.min(y, d => d[0]))

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
    console.log(this.svg.selectAll('.g-stack').selectAll('rect').selectAll('title'))


    if (this.schema === 'grouped') {
      this.grouped();
    } else if (this.schema === 'percent') {
      this.percent();
    } else {
      this.stacked();
    }

    this.chartState.activeKeyCountPrevPostive = d3.sum(this.chartState.keys.map((k, i) => k.active && (i % 2 === 1) ? 1 : 0))
    this.chartState.activeKeyCountPrevNegtive = d3.sum(this.chartState.keys.map((k, i) => k.active && (i % 2 === 0) ? 1 : 0))
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
    this.updateChart();
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
      this.updateChart();
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

    if (this.schema === 'grouped') {
      this.grouped();
    } else if (this.schema === 'percent') {
      this.percent();
    } else {
      this.stacked();
    }
  }

  isCategoryDisable(key) {
    var condition = this.chartState.keys.filter(k => k.active).length <= 1;
    var condition2 = key.active;

    return condition && condition2;
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
