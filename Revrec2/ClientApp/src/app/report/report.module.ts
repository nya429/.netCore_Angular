import { TableauContainerComponent } from './tableau-container/tableau-container.component';
import { MaterialModule } from './../material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportContainerComponent } from './report-container/report-container.component';
import { ReportRoutingModule } from './report.routing.module';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    MaterialModule,
    ReportRoutingModule,
  ],
  declarations: [
    ReportContainerComponent,
    TableauContainerComponent
  ],
  exports: [

  ]

})
export class ReportModule { }
