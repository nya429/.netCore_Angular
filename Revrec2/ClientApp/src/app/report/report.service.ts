import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  windowResized = new Subject<null>();
  
  constructor() { }

  onWindowResize() {
    this.windowResized.next();
  }
}
