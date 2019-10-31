import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AssignmentsRoutingModule } from './assignment.routing.module';

import { AssignmentContainerComponent } from './assignment-container/assignment-container.component';
import { AssignmentListContainerComponent } from './assignment-list-container/assignment-list-container.component';
import { AssignmentListComponent } from './assignment-list/assignment-list.component';
import { AssignmentInfoComponent } from './assignment-info/assignment-info.component';

@NgModule({
  imports: [
    BrowserModule,
    SharedModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AssignmentsRoutingModule,
  ],
  declarations: [
    AssignmentContainerComponent,
    AssignmentListContainerComponent,
    AssignmentListComponent,
    AssignmentInfoComponent
  ]
})
export class AssignmentModule { }
