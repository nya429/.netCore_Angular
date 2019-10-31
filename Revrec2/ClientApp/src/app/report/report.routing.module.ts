import { TableauContainerComponent } from './tableau-container/tableau-container.component';
import { ReportContainerComponent } from './report-container/report-container.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const reportRoutes: Routes = [
  {
    path: 'reports',
    component: ReportContainerComponent,
    children: [
      { path: 'gdp', component: TableauContainerComponent },
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
