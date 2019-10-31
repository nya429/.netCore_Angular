import { MemberService } from './member.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from './../material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgePipe, EligibilityPipe } from '../shared/age.pipe';

import { MemberContainerComponent } from './member-container/member-container.component';
import { MemberListComponent } from './member-list/member-list.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MemberInfoComponent } from './member-info/member-info.component';
import { SharedModule } from '../shared/shared.module';
import { MembersRoutingModule } from './member.routing.module';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    RouterModule,
    MembersRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SharedModule
  ],
  exports: [
  ],
  declarations: [
    // AgePipe,
    // EligibilityPipe,
    MemberContainerComponent, 
    MemberListComponent, 
    MemberInfoComponent
  ],
  providers: [
    MemberService,
  ]
})
export class MemberModule { }
