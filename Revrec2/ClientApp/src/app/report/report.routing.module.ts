import { TableauContainerComponent } from './tableau-container/tableau-container.component';
import { ReportContainerComponent } from './report-container/report-container.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportOperationalComponent } from './report-operational/report-operational.component';
import { ReportFinancialComponent } from './report-financial/report-financial.component';
import { ReportProductivityComponent } from './report-productivity/report-productivity.component';
import { AuthGuard } from '../auth/auth-guard.service';
import { ReportProductivityContainerComponent } from './report-productivity-container/report-productivity-container.component';

const reportRoutes: Routes = [
  {
    path: 'reports',
    component: ReportContainerComponent,
    children: [
      {
        path: 'productivity', component: ReportProductivityContainerComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRoles: '1010'
        }
      },
      {
        path: 'tableau', component: TableauContainerComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRoles: '1111'
        }
      },
      {
        path: 'operational', component: ReportOperationalComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRoles: '1010'
        }
      },
      {
        path: 'financial', component: ReportFinancialComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRoles: '1010'
        }
      },


      // { path: '', redirectTo: 'operational', pathMatch: 'full' },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(reportRoutes)
  ],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
