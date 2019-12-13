import { MemberService } from './../member/member.service';
import { Injectable, Inject } from '@angular/core';
// import { DisElement } from '../MOCK_DATA';
import { Subject } from 'rxjs';
import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private baseUrl: string;

  // MOCK
  private displayedDiscrepancy: any;

  public onDiscrepancyDetailOpened = new Subject<any>();

  constructor(private http: HttpClient, 
    @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
   }

    // MOCK
   onDiscrepancyDetailOpen(e: any): void {
     console.log(e)
     this.displayedDiscrepancy = e;
     this.onDiscrepancyDetailOpened.next(this.displayedDiscrepancy);
   }

    // MOCK
   onDiscrepancyDetailClose(): void {
      this.displayedDiscrepancy = null;
      this.onDiscrepancyDetailOpened.next(this.displayedDiscrepancy);
   }
}
