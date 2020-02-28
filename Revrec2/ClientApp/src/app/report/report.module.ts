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

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    MaterialModule,
    ReportRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    ReportContainerComponent,
    TableauContainerComponent,
    ReportOperationalComponent,
    ReportFinancialComponent,
    ReportProductivityComponent
  ],
  exports: [

  ]

})
export class ReportModule { }
