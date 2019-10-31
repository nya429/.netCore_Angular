import { SharedService } from './shared.service';
import { HighLighttDirective } from './highlight.directive';
import { DateValidatorDirective, DateInputFormatDirective } from './date.validate.directive';
import { ClickOutsideDirective } from './click-outside.directive';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from './../material.module';

import { DiscrepancyListComponent } from './discrepancy-list/discrepancy-list.component';
import { MonthlySummaryRecordListComponent } from './monthly-summary-record-list/monthly-summary-record-list.component';
import { AgePipe, EligibilityPipe, SqlDateFormatPipe } from './age.pipe';

import { SignTimePipe } from './age.pipe';
import { TooltipDirective } from './tooltip.directive';
import { TooltipComponent } from './tooltip/tooltip.component';
import { ComingsoonComponent } from './comingsoon/comingsoon.component';
import { CommentaryContainerComponent } from './commentary-container/commentary-container.component';
import { CommentaryListComponent } from './commentary-list/commentary-list.component';
import { CommentaryListItemComponent } from './commentary-list-item/commentary-list-item.component';
import { CommentaryInputComponent } from './commentary-input/commentary-input.component';
import { DiscrepancySnackbarComponent } from './discrepancy-list/discrepancy-snackbar/discrepancy-snackbar.component';
import { CommentaryItemComponent } from './commentary-item/commentary-item.component';
import { DiscrepancyDetailContainerComponent } from './discrepancy-detail-container/discrepancy-detail-container.component';
import { DiscreapcnyUpdateDialogComponent } from './discrepancy-update-dialog/discrepancy-update-dialog.component';



@NgModule({
  imports: [
    CommonModule,
    // BrowserModule,
    FormsModule,
    RouterModule,
    MaterialModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
  ],
  declarations: [
    // Pipe
    AgePipe,
    EligibilityPipe,
    SignTimePipe,
    SqlDateFormatPipe,
    // Directive
    TooltipDirective, 
    ClickOutsideDirective,
    DateValidatorDirective,
    DateInputFormatDirective,
    HighLighttDirective,
    // Component
    ComingsoonComponent,
    CommentaryListComponent, 
    CommentaryListItemComponent, 
    CommentaryItemComponent, 
    CommentaryInputComponent, 
    CommentaryContainerComponent, 
    DiscrepancyListComponent, 
    DiscreapcnyUpdateDialogComponent, 
    DiscrepancySnackbarComponent,
    MonthlySummaryRecordListComponent,
    TooltipComponent,
    DiscrepancyDetailContainerComponent,
  ],
  exports: [
    // Pipe
    AgePipe,
    EligibilityPipe,
    SignTimePipe,
    SqlDateFormatPipe,
    // Directive
    TooltipDirective, 
    ClickOutsideDirective,
    DateValidatorDirective,
    DateInputFormatDirective,
    HighLighttDirective,
    // Component
    DiscreapcnyUpdateDialogComponent, 
    DiscrepancyListComponent, 
    CommentaryContainerComponent, 
    CommentaryListComponent, 
    CommentaryListItemComponent, 
    CommentaryInputComponent,
    CommentaryItemComponent,  
    DiscrepancySnackbarComponent,
    MonthlySummaryRecordListComponent,
    TooltipComponent, 
    DiscrepancyDetailContainerComponent
  ],
  providers: [ 
    DateValidatorDirective, 
    DateInputFormatDirective,    
    HighLighttDirective,
    SharedService
  ]
})
export class SharedModule { }
