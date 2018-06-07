import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';
import { DbSupportDashboardComponent } from './db-support-dashboard/db-support-dashboard.component';
import { DbSupportComponent } from './db-support.component';
import { DbSupportActivitySelectionComponent } from './db-support-activity-selection/db-support-activity-selection.component';
import { DbSupportDuplicatesComponent } from './db-support-duplicates/db-support-duplicates.component';
import { DbSupportMissingDataComponent } from './db-support-missing-data/db-support-missing-data.component';
import { DbSupportOutliersComponent } from './db-support-outliers/db-support-outliers.component';

const routes: Routes = [
  {
    path: 'database-support',
    component: DbSupportComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard', component: DbSupportDashboardComponent,
        children: [
          {path: '', component: DbSupportActivitySelectionComponent},
          {path: 'duplicates', component: DbSupportDuplicatesComponent},
          {path: 'missing-data', component: DbSupportMissingDataComponent},
          {path: 'outliers', component: DbSupportOutliersComponent}
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DbSupportRoutingModule {
}
