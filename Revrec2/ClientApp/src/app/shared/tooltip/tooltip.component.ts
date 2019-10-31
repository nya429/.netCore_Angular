import { DisElement } from 'src/app/MOCK_DATA';
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  @Input() tipInfo: {tipType: string, content: any};

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
      case 'rc': {
        this.tipType = 'Rate Cell Variance';
        this.tipSubtitle = 'CCA vs State'
        this.tipContent = `${this.tipInfo.content.org_ratecell} Vs ${this.tipInfo.content.payor_ratecell}`;
        break;
      }
      case 're': {
        this.tipType = 'Region Variance';
        this.tipSubtitle = 'CCA vs State'
        this.tipContent = `${this.tipInfo.content.org_region} Vs ${this.tipInfo.content.payor_region}`;
        break;
      }
      case 'pp': {
        this.tipType = 'Patient Pay Variance';
        this.tipSubtitle = 'CCA vs State'
        this.tipContent = `$${this.tipInfo.content.org_pp} Vs $${this.tipInfo.content.payor_pp}`;
        break;
      }
      case 'sp': {
        this.tipType = 'pp2 Variance';
        this.tipSubtitle = 'CCA vs State'
        this.tipContent = `$${this.tipInfo.content.org_sp} Vs $${this.tipInfo.content.payor_sp}`;
        break;
      }
      case 'va': {
        this.tipType = 'Payment Variance';
        this.tipSubtitle = 'state_paid - (cca_preimum - ( cca_pp + cca_sp))'
        this.tipContent = `$${this.tipInfo.content.payor_paid.toFixed(2)} - ($${this.tipInfo.content.org_premium} - ($${this.tipInfo.content.org_pp} + $${this.tipInfo.content.org_sp}))`;
        break;
      }
      case 'pe': {
        let unexplained = this.tipInfo.content.payor_paid - (this.tipInfo.content.payor_premium - this.tipInfo.content.payor_pp - this.tipInfo.content.payor_sp)
        this.tipType = `Payment Error: ${unexplained > 0 ? '$' + unexplained.toFixed(2) : '-$' + (unexplained * -1).toFixed(2)}`;
        this.tipSubtitle = ' state_paid - (state_Premium - (state_pp + state_sp))'
        this.tipContent = `$${this.tipInfo.content.payor_paid.toFixed(2)} - ($${this.tipInfo.content.payor_premium} - ($${this.tipInfo.content.payor_pp} + $${this.tipInfo.content.payor_sp})) `;
        break;
      }
      case 'st': {
        this.tipType = '';
        this.tipSubtitle = ''
        this.tipContent = `${this.tipInfo.content.status}`;
        break;
      }

      case 'payment_error': {
        this.tipType = 'Payment Error';
        this.tipSubtitle = 'StatePaid - (StatePremium - (CCAPatientPay + StateSpenddown))'
        this.tipContent = `$${this.tipInfo.content.paidCapitationAmount} - ($${this.tipInfo.content.mmisAmount} - ($${this.tipInfo.content.mmisPatientPay} + $${this.tipInfo.content.mmisPatientSpendDown})) `;
        break;
      }
      
      case 'payment_variance': {
        this.tipType = 'Payment Variance';
        this.tipSubtitle = 'StatePaid - (CCAPreimum - ( CCAPatientPay + CCASpenddown))'
        this.tipContent = `$${this.tipInfo.content.paidCapitationAmount} - ($${this.tipInfo.content.ccaAmount} - ($${this.tipInfo.content.ccaPatientPay} + $${this.tipInfo.content.ccaPatientSpendDown}))`;
        break;
      }

      case 'typeRateCell': {
        this.tipType = 'Rate Cell Variance';
        this.tipSubtitle = 'CCA RateCell VS State RateCell'
        this.tipContent = `${this.tipInfo.content.ccaRateCell} VS ${this.tipInfo.content.mmisRateCell}`;
        break;
      }
      
      case 'typePatientPay': {
        this.tipType = 'Patient Pay Variance';
        this.tipSubtitle = 'CCA PatientPay VS State PatientPay'
        this.tipContent = `$${this.tipInfo.content.ccaPatientPay} VS $${this.tipInfo.content.mmisPatientPay}`;
        break;
      }

      case 'typePatientSpendDown': {
        this.tipType = 'SpendDown Variance';
        this.tipSubtitle = 'CCA SpendDown vs State SpendDown'
        this.tipContent = `${this.tipInfo.content.ccaPatientSpendDown} VS ${this.tipInfo.content.mmisPatientSpendDown}`;
        break;
      }

      case 'typeRegion': {
        this.tipType = 'Region Variance';
        this.tipSubtitle = 'CCA Region VS State Region'
        this.tipContent = `${this.tipInfo.content.ccaRegion} VS ${this.tipInfo.content.mmisRegion}`;
        break;
      }

      default: 
        break;
    }
  } 

}
