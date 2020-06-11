import { ReportProductivityDetailComponent } from './report/report-productivity-detail/report-productivity-detail.component';
import { ComingsoonComponent } from './shared/comingsoon/comingsoon.component';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './navigation/home/home.component';
import { MemberContainerComponent } from './member/member-container/member-container.component';
import { DiscrepancyContainerComponent } from './discrepancy/discrepancy-container/discrepancy-container.component';
import { ReportContainerComponent } from './report/report-container/report-container.component';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { AuthGuard } from './auth/auth-guard.service';


const appRoutes: Routes = [

    {
        path: 'discrepancies',
        component: DiscrepancyContainerComponent,
        pathMatch: 'full',
        canActivate: [AuthGuard],
        data: {
            expectedRoles: '1011'
        },
    },
    {
        path: 'FAQs',
        component: ComingsoonComponent,
        pathMatch: 'full'
    },
    {
        path: 'home',
        // redirectTo: '/reports/operational',
        pathMatch: 'full',
        canActivate: [AuthGuard],
        data: {
            expectedRoles: '1111'
        },
        component: HomeComponent,
        // pathMatch: 'full'
    },
    {
        path: 'unauthroized',
        component: UnauthorizedComponent,
        pathMatch: 'full'
    },

    { path: '', redirectTo: '/home', pathMatch: 'full' },

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