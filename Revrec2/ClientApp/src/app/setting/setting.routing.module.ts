import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingContainerComponent } from './setting-container/setting-container.component';
import { SettingRatecardComponent } from './setting-ratecard/setting-ratecard.component';
import { SettingRatecardMappingComponent } from './setting-ratecard-mapping/setting-ratecard-mapping.component';
import { SettingDiscrepancyStatusComponent } from './setting-discrepancy-status/setting-discrepancy-status.component';
import { SettingDiscrepancyCategoryComponent } from './setting-discrepancy-category/setting-discrepancy-category.component';
import { SettingUserComponent } from './setting-user/setting-user.component';
import { AuthGuard } from '../auth/auth-guard.service';


const SettingRoutes: Routes = [
    {
        path: 'settings', component: SettingContainerComponent,
        children: [
            {
                path: 'ratecards',
                component: SettingRatecardComponent,
                canActivate: [AuthGuard],
                data: {
                    expectedRoles: '1011'
                }
            },
            {
                path: 'ratecell-region-mappings',
                component: SettingRatecardMappingComponent,
                canActivate: [AuthGuard],
                data: {
                    expectedRoles: '1000'
                }
            },
            {
                path: 'discrepancy-statuses',
                component: SettingDiscrepancyStatusComponent,
                canActivate: [AuthGuard],
                data: {
                    expectedRoles: '1010'
                }
            },
            {
                path: 'discrepancy-categories',
                component: SettingDiscrepancyCategoryComponent,
                canActivate: [AuthGuard],
                data: {
                    expectedRoles: '1010'
                }
            },
            {
                path: 'users',
                component: SettingUserComponent,
                // canActivate: [AuthGuard],
                data: {
                    expectedRoles: '1110'
                }
            },
            // { path: '', redirectTo: 'ratecards', pathMatch: 'full' },
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(SettingRoutes)
    ],
    exports: [RouterModule]
})
export class SettingRoutingModule { }