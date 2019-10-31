import { AuthModule } from './auth/auth.module';
import { SettingService } from './setting/setting.service';
import { AssignmentModule } from './assignment/assignment.module';
import { MemberModule } from './member/member.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
// import { HeaderComponent } from './navigation/header/header.component';
// import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
// import { HomeComponent } from './navigation/home/home.component';

import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth-guard.service';
import { NavigationModule } from './navigation/navigation.module';
import { SharedModule } from './shared/shared.module';
import { DiscrepancyModule } from './discrepancy/discrepancy.module';
import { CommonModule } from '@angular/common';
import { SettingModule } from './setting/setting.module';

import { TooltipComponent } from './shared/tooltip/tooltip.component';
import { DiscreapcnyUpdateDialogComponent } from './shared/discrepancy-update-dialog/discrepancy-update-dialog.component';
import { AppService } from './app.service';
import { AuthInterceptor } from './auth/auth.interceptor';
import { ReportModule } from './report/report.module';

@NgModule({
  declarations: [
    AppComponent,
    // HeaderComponent,
    // HomeComponent,
    // SidenavListComponent,
  ],
  imports: [
    // RouterModule.forRoot([{path: '', redirectTo: '/home', pathMatch: 'full'}]),
    CommonModule,
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    AuthModule,
    FlexLayoutModule,
    NavigationModule,
    AssignmentModule,
    SharedModule,
    MemberModule,
    DiscrepancyModule,
    SettingModule,
    ReportModule,
    AppRoutingModule,
  ],
  entryComponents: [
    DiscreapcnyUpdateDialogComponent,
    TooltipComponent
  ],
  providers: [AuthGuard,
    {
      deps: [AuthService],
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
