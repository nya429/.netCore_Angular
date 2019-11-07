import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemberInfoComponent } from './member-info/member-info.component';
import { MonthlySummaryRecordListComponent } from './../shared/monthly-summary-record-list/monthly-summary-record-list.component';
import { DiscrepancyListComponent } from './../shared/discrepancy-list/discrepancy-list.component';
import { MemberContainerComponent } from './member-container/member-container.component';
import { AuthGuard } from '../auth/auth-guard.service';

const membersRoutes: Routes = [
    {path: 'members',
        component: MemberContainerComponent,
        canActivate: [AuthGuard],
        data: {
            expectedRoles: '1111'
        },
        children: [
            {path: ':id',
             component: MemberInfoComponent,
             outlet: 'bio',
             canActivate: [AuthGuard],
             data: {
                 expectedRoles: '1111'
             }
            //  children: [
            //      {path: 'discrepancies', component: DiscrepancyListComponent},
            //      {path: 'monthly_summary_records', component: MonthlySummaryRecordListComponent},
            //      {path: '', redirectTo: 'discrepancies', pathMatch: 'full'},
            // ]
            },
            {path: ':id',
            component: MemberInfoComponent,
            outlet: 'mmis',}
        ]
    },
//     {path: 'members/:id',
//     component: MemberInfoComponent,
//          children: [
//              {path: 'discrepancies', component: DiscrepancyListComponent},
//              {path: 'monthly_summary_records', component: MonthlySummaryRecordListComponent},
//              {path: '', redirectTo: 'monthly_summary_records', pathMatch: 'full'},
//         ]
    
    
// },
];

@NgModule({
    imports: [
        RouterModule.forChild(membersRoutes)
    ],
    exports: [RouterModule]
})
export class MembersRoutingModule {}