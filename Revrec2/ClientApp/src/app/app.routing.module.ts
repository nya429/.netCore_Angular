import { ComingsoonComponent } from './shared/comingsoon/comingsoon.component';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './navigation/home/home.component';
import { MemberContainerComponent } from './member/member-container/member-container.component';
import { DiscrepancyContainerComponent } from './discrepancy/discrepancy-container/discrepancy-container.component';
import { ReportContainerComponent } from './report/report-container/report-container.component';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';


const appRoutes: Routes = [

    {
        path: 'discrepancies',
        component: DiscrepancyContainerComponent,
        pathMatch: 'full'
    },
    {
        path: 'FAQs',
        component: ComingsoonComponent,
        pathMatch: 'full'
    },
    {
        path: 'home',
        redirectTo: '/reports/gdp',
        pathMatch: 'full'
        // component: ReportContainerComponent,
        // pathMatch: 'full'
    },
    {
        path: 'unauthroized',
        component: UnauthorizedComponent,
        pathMatch: 'full'
    },
    { path: '', redirectTo: '/reports/gdp', pathMatch: 'full' },

];
@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes,
            // { enableTracing: true }
        ),
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }