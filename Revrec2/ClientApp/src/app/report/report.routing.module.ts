import { TableauContainerComponent } from './tableau-container/tableau-container.component';
import { ReportContainerComponent } from './report-container/report-container.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportOperationalComponent } from './report-operational/report-operational.component';
import { ReportFinancialComponent } from './report-financial/report-financial.component';
import { ReportProductivityComponent } from './report-productivity/report-productivity.component';

const reportRoutes: Routes = [
  {
    path: 'reports',
    component: ReportContainerComponent,
    children: [
      { path: 'gdp', component: TableauContainerComponent },
      { path: 'operational', component: ReportOperationalComponent },
      { path: 'financial', component: ReportFinancialComponent },
      { path: 'productivity', component: ReportProductivityComponent },
      { path: '', redirectTo: 'gdp', pathMatch: 'full' },
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
