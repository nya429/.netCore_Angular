import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { SettingUserComponent } from './setting-user/setting-user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from './../material.module';
import { SettingRoutingModule } from './setting.routing.module';

import { SettingService } from './setting.service';
import { SettingContainerComponent } from './setting-container/setting-container.component';
import { SettingRatecardMappingComponent } from './setting-ratecard-mapping/setting-ratecard-mapping.component';
import { SettingRatecardComponent } from './setting-ratecard/setting-ratecard.component';
import { SettingRatecardListComponent } from './setting-ratecard/setting-ratecard-list/setting-ratecard-list.component';
import { SettingRatecardFormDialogComponent, TwoDigitDecimaNumberDirective } from './setting-ratecard/setting-ratecard-form-dialog/setting-ratecard-form-dialog.component';
import { SettingDiscrepancyStatusComponent } from './setting-discrepancy-status/setting-discrepancy-status.component';

import { SettingRatecellMappingListComponent } from './setting-ratecard-mapping/setting-ratecell-mapping-list/setting-ratecell-mapping-list.component';
import { SettingRegionMappingListComponent } from './setting-ratecard-mapping/setting-region-mapping-list/setting-region-mapping-list.component';
import { SharedModule } from '../shared/shared.module';
import { SettingDiscrepancyStatusFormDialogComponent } from './setting-discrepancy-status/setting-discrepancy-status-form-dialog/setting-discrepancy-status-form-dialog.component';
import { SettingDiscrepancyStatusListComponent } from './setting-discrepancy-status/setting-discrepancy-status-list/setting-discrepancy-status-list.component';
import { SettingUserListComponent } from './setting-user/setting-user-list/setting-user-list.component';
import { SettingUserFormDialogComponent } from './setting-user/setting-user-form-dialog/setting-user-form-dialog.component';
import { SettingDiscrepancyCategoryComponent } from './setting-discrepancy-category/setting-discrepancy-category.component';
import { SettingDiscrepancyCategoryListComponent } from './setting-discrepancy-category/setting-discrepancy-category-list/setting-discrepancy-category-list.component';
import { SettingDiscrepancyCategoryFormDialogComponent } from './setting-discrepancy-category/setting-discrepancy-category-form-dialog/setting-discrepancy-category-form-dialog.component';

@NgModule({
  imports: [
    // CommonModule,
    BrowserModule,
    MaterialModule,
    SettingRoutingModule,
    SharedModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
  ],
  declarations: [
    TwoDigitDecimaNumberDirective,
    SettingContainerComponent,
    SettingRatecardComponent,
    SettingUserComponent,
    SettingRatecardMappingComponent,
    SettingDiscrepancyStatusComponent,
    SettingRatecardListComponent,
    SettingRatecardFormDialogComponent,
    SettingRatecellMappingListComponent,
    SettingRegionMappingListComponent,
    SettingDiscrepancyStatusFormDialogComponent,
    SettingDiscrepancyStatusListComponent,
    SettingUserListComponent,
    SettingUserFormDialogComponent,
    SettingDiscrepancyCategoryComponent,
    SettingDiscrepancyCategoryListComponent,
    SettingDiscrepancyCategoryFormDialogComponent
  ],
  providers: [
    SettingService,

  ],
  entryComponents: [
    SettingRatecardFormDialogComponent,
    SettingDiscrepancyCategoryFormDialogComponent,
    SettingDiscrepancyStatusFormDialogComponent,
    SettingUserFormDialogComponent
  ]
})
export class SettingModule { }
