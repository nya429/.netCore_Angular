import { AssignmentInfoComponent } from './assignment-info/assignment-info.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssignmentContainerComponent } from './assignment-container/assignment-container.component';

const AssignmentRoutes: Routes = [
    {path: 'worklist',
        component: AssignmentContainerComponent,
        children: [
            {path: ':id',
             component: AssignmentInfoComponent,
             outlet: 'patient'
            //  children: [
            //      {path: 'discrepancies', component: DiscrepancyListComponent},
            //      {path: 'monthly_summary_records', component: MonthlySummaryRecordListComponent},
            //      {path: '', redirectTo: 'discrepancies', pathMatch: 'full'},
            // ]
            }
        ]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(AssignmentRoutes)
    ],
    exports: [RouterModule]
})
export class AssignmentsRoutingModule {}