import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from '../app.routing.module';
import { MaterialModule } from './../material.module';

import { HeaderComponent } from './header/header.component';
import { SidenavListComponent } from './sidenav-list/sidenav-list.component';
import { HomeComponent } from './home/home.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
     HeaderComponent,
     SidenavListComponent,
     HomeComponent
    ],
  imports: [
    CommonModule,
    MaterialModule,
    AppRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ], exports:[
    HeaderComponent,
    SidenavListComponent,
    HomeComponent
  ]
})
export class NavigationModule { }
