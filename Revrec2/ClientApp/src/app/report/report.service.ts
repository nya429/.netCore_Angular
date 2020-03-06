import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  windowResized = new Subject<null>();
  operationalReportReady = new Subject<any>();



  constructor() { }

  onWindowResize() {
    this.windowResized.next();
  }

  getReport() {
    
  }
}
