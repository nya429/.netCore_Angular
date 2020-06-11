// import { DisElement } from 'src/app/MOCK_DATA';
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css'],
  animations: [
    trigger('tooltip', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate(100, style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class TooltipComponent implements OnInit {
  @Input() tipInfo: {tipType: string, tipTitle: string, content: any};

  tipType: string;
  tipSubtitle: string;
  tipContent: String;

  constructor() { }

  ngOnInit() {
    this.contentInit();
  }

  contentInit(): void {
    // console.log('contentInit', this.tipInfo);
    switch(this.tipInfo.tipType) {
      case 'st': {
        this.tipType = '';
        this.tipSubtitle = ''
        this.tipContent = `${this.tipInfo.content.status}`;
        break;
      }

      case 'payment_error': {
        this.tipType = 'Payment Error';
        this.tipSubtitle = 'State Paid - (State Premium - (State Patient Pay + State Spend down))'
        this.tipContent = `$${this.tipInfo.content.paidCapitationAmount} - ($${this.tipInfo.content.mmisAmount} - ($${this.tipInfo.content.mmisPatientPay} + $${this.tipInfo.content.mmisPatientSpendDown})) `;
        break;
      }
      
      case 'payment_variance': {
        this.tipType = 'Payment Variance';
        this.tipSubtitle = 'State Paid - (CCA Preimum - ( CCA Patient Pay + CCA Spend Down))'
        this.tipContent = `$${this.tipInfo.content.paidCapitationAmount} - ($${this.tipInfo.content.ccaAmount} - ($${this.tipInfo.content.ccaPatientPay} + $${this.tipInfo.content.ccaPatientSpendDown}))`;
        break;
      }

      case 'typeRateCell': {
        this.tipType = 'Rate Cell Variance';
        this.tipSubtitle = 'CCA Rate Cell VS State Rate Cell'
        this.tipContent = `${this.tipInfo.content.ccaRateCell} VS ${this.tipInfo.content.mmisRateCell}`;
        break;
      }
      
      case 'typePatientPay': {
        this.tipType = 'Patient Pay Variance';
        this.tipSubtitle = 'CCA Patient Pay VS State Patient Pay'
        this.tipContent = `$${this.tipInfo.content.ccaPatientPay} VS $${this.tipInfo.content.mmisPatientPay}`;
        break;
      }

      case 'typePatientSpendDown': {
        this.tipType = 'SpendDown Variance';
        this.tipSubtitle = 'CCA Spend Down vs State Spend Down'
        this.tipContent = `${this.tipInfo.content.ccaPatientSpendDown} VS ${this.tipInfo.content.mmisPatientSpendDown}`;
        break;
      }

      case 'typeRegion': {
        this.tipType = 'Region Variance';
        this.tipSubtitle = 'CCA Region VS State Region'
        this.tipContent = `${this.tipInfo.content.ccaRegion} VS ${this.tipInfo.content.mmisRegion}`;
        break;
      }

      case 'discreapcnyCategoryDescription': {
        this.tipType = 'Discreapcny Category Description';
        this.tipSubtitle = ''
        this.tipContent = `${this.tipInfo.content.discrepancyCategoryDescription}`;
        break;
      }

      case 'filterList': {
        this.tipType = `Selected ${this.tipSubtitle}`;
        this.tipSubtitle = ''
        this.tipContent = `${this.tipInfo.content}`;
        break;
      }

      default: 
        break;
    }
  } 

}
