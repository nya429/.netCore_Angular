import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { PagedList, ResponseList, Response } from '../model/response.model'
import { ReportOperational, ReportFinancial, ReportOperationalDetail, ReportProductivity, ReportProductivityGroup } from './../model/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl: string;

  public windowResized = new Subject<null>();
  public reportOperationalReady = new Subject<ReportOperational[]>();
  public reportOperationalDetailReady = new Subject<ReportOperationalDetail[]>();
  public reportFinancialReady = new Subject<ReportFinancial[]>();
  public reportProductivityReady = new Subject<Response<ResponseList<ReportProductivityGroup>>>();
  public reportProductivityDetailReady = new Subject<Response<ResponseList<ReportProductivity>>>();
  constructor(private http: HttpClient,
    @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl + 'api/';
  }

  onWindowResize() {
    this.windowResized.next();
  }

  getMonths(reportlist: object[]) {
    return reportlist.map(report => report['month'])
  }

  getReportOperational(con) {
    const url = this.baseUrl + 'report/operational';

    const filters = {
      endDate: con.endDate ? con.endDate : null,
      startDate: con.startDate ? con.startDate : null
    };

    let requestBody = { ...filters };

    console.log("Get Report Operational", url, requestBody)
    return this.http.post<Response<ResponseList<ReportOperational>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    })
      .subscribe(result => {
        if (result.isSuccess) {
          console.log("Get Report Operational =>", result.data)
          this.reportOperationalReady.next(result.data.list);
        }
      });
  }

  getReportOperationalDetail(con) {
    const url = this.baseUrl + 'report/operational/detail';

    const filters = {
      month: con.month,
      isEnrolled: con.isEnrolled,
      isResolved: con.isResolved
    };

    let requestBody = { ...filters };

    console.log("Get Report OperationalDetail", url, requestBody)
    return this.http.post<Response<ResponseList<ReportOperationalDetail>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    })
      .subscribe(result => {
        if (result.isSuccess) {
          console.log("Get Report OperationalDetail =>", result.data)
          this.reportOperationalDetailReady.next(result.data.list);
        }
      });
  }


  getReportFinancial(con) {
    const url = this.baseUrl + 'report/financial';

    const filters = {
      endDate: con.endDate ? con.endDate : null,
      startDate: con.startDate ? con.startDate : null
    };

    let requestBody = { ...filters };

    console.log("Get Report Financial", url, requestBody)
    return this.http.post<Response<ResponseList<ReportFinancial>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    })
      .subscribe(result => {
        if (result.isSuccess) {
          console.log("Get Report Financial =>", result.data)
          this.reportFinancialReady.next(result.data.list);
        }
      });
  }

  getReportProductivity(con) {
    const url = this.baseUrl + 'report/productivity';
    var checkPointType = con.checkPointType ? con.checkPointType : null;

    const filters = {
      checkPointType: con.checkPointType ? con.checkPointType : null,
      startDate: con.startDate ? con.startDate : null,
      endDate: con.endDate ? con.endDate : null,
    };

    let requestBody = { ...filters };

    console.log("Get Report Productivity", url, requestBody)
    return this.http.post<Response<ResponseList<ReportProductivityGroup>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log("Get Report Productivity =>", result.data)
        // result.data.list = this.removePrevious(result.data.list) as  ReportProductivityGroup[];
        result.extra = { checkPointType: checkPointType }
        this.reportProductivityReady.next(result);
      }
    });
  }

  getReportProductivityDetail(userId, con) {
    const url = this.baseUrl + `report/productivity/${userId}`;
    var checkPointType = con.checkPointType ? con.checkPointType : null
    const filters = {
      checkPointType: checkPointType,
      startDate: con.startDate ? con.startDate : null,
      endDate: con.endDate ? con.endDate : null,
      pageIndex: con.pageIndex ? con.pageIndex : 0,
      pageSize: con.pageSize ? con.pageSize : 25,
      sortBy: con.sortBy ? con.sortBy : '',
      orderBy: con.orderBy ? con.orderBy : '',
    };

    let requestBody = { ...filters };

    console.log("Get Report Productivity Detail ", url, requestBody)
    return this.http.post<Response<PagedList<ReportProductivity>>>(url, requestBody, {
      observe: 'body',
      responseType: 'json'
    }).subscribe(result => {
      if (result.isSuccess) {
        console.log(result.data)
        result.extra = { checkPointType: checkPointType }
        this.reportProductivityDetailReady.next(result);
      }
    });
  }

  // removePrevious(list: ReportProductivity[] | ReportProductivityGroup[]) : ReportProductivity[] | ReportProductivityGroup[] {
  //   var earlistDate;

  //   list.forEach((p: ReportProductivity | ReportProductivityGroup) => {
  //     if (!earlistDate || Date.parse(earlistDate) > Date.parse(p.dateTime))
  //       earlistDate = p.dateTime;
  //   });

  //   return list.filter((p: ReportProductivity | ReportProductivityGroup) => p.dateTime !== earlistDate);
  // }

  downloadTest(report, fileName: string = "myFile.csv") {
    console.log('convert start');
    const data = report;
    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');
    console.log('convert end');
    var a = document.createElement('a');
    var blob = new Blob([csvArray], { type: 'text/csv' }),
      url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  numberadd(a, b) {
    let sumstr = (this._dpIndex(a) + this._dpIndex(b)) + '';
    if (sumstr.length > 2) {
      sumstr = sumstr.slice(0, -2) + '.' + sumstr.slice(-2);
    } else if (sumstr.length <= 2 && sumstr.length > 1) {
      sumstr = '0.' + sumstr.slice(-2);
    } else {
      sumstr = '0'
    }

    // console.log(dpIndex(a), dpIndex(b), +sumstr)
    return +sumstr;
  }

  private _dpIndex(n: number) {
    const frctionalPart = 2;
    const numberStr = n + "";
    const dpindex = numberStr.indexOf(".");

    if (dpindex > 0) {
      const fractionalLen = (numberStr.length - 1) - dpindex;
      // console.log(numberStr, numberStr.replace('.', ''), "0".repeat(frctionalPart - fractionalLen),  numberStr.replace('.', '') + "0".repeat(frctionalPart - fractionalLen))
      return +(numberStr.replace('.', '') + "0".repeat(frctionalPart - fractionalLen));
    }

    return +(n !== 0 ? n + "00" : '0');
  }

  currencyConverter(n: number) {
    const currencyFn = (str) => str.split('').reverse().map((n, i) => (i + 1) % 3 || i === str.length - 1 ? n : ',' + n).reverse().join('')
    const frctionalPart = 2;
    let numberStr = Math.abs(n) + "";
    const dpIndex = numberStr.indexOf(".");
    const fractionalLen = (numberStr.length - 1) - dpIndex;

    if (dpIndex < 0) {
      return (n < 0 ? '-' : '') + '$' + currencyFn(numberStr)
    }

    let wholeNumber = numberStr.substring(0, dpIndex)
    let fractionalNumber = numberStr.substring(dpIndex) + "0".repeat(frctionalPart - fractionalLen)

    return (n < 0 ? '-' : '') + '$' + currencyFn(wholeNumber) + fractionalNumber
  }
}
