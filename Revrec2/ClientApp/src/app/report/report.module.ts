import { ReportProductivity } from './../model/report.model';
import { MaterialModule } from './../material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportRoutingModule } from './report.routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TableauContainerComponent } from './tableau-container/tableau-container.component';
import { ReportContainerComponent } from './report-container/report-container.component';
import { ReportFinancialComponent } from './report-financial/report-financial.component';
import { ReportOperationalComponent } from './report-operational/report-operational.component';
import { ReportProductivityComponent } from './report-productivity/report-productivity.component';
import { ReportOperationalDetailComponent } from './report-operational-detail/report-operational-detail.component';
import { SharedModule } from '../shared/shared.module';
import { ReportProductivityDetailComponent } from './report-productivity-detail/report-productivity-detail.component';
import { ReportProductivityDetailContainerComponent } from './report-productivity-detail-container/report-productivity-detail-container.component';
import { ReportProductivityContainerComponent } from './report-productivity-container/report-productivity-container.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    MaterialModule,
    ReportRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    ReportContainerComponent,
    TableauContainerComponent,
    ReportOperationalComponent,
    ReportOperationalDetailComponent,
    ReportFinancialComponent,
    ReportProductivityComponent,
    ReportProductivityDetailComponent,
    ReportProductivityDetailContainerComponent,
    ReportProductivityContainerComponent,
    // ReportOperationalDetail2Component
  ],
  exports: [
    ReportProductivityDetailContainerComponent,
    ReportProductivityContainerComponent,
  ]

})
export class ReportModule { }
