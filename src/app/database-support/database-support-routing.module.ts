import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';
import { DatabaseDashboardComponent } from './db-support-dashboard/database-dashboard.component';
import { DataEditingComponent } from './data-editing/data-editing.component';
import { DataUploadComponent } from './data-upload/data-upload.component';
import { DbSupportConsoleComponent } from './db-support-console/db-support-console.component';
import { DuplicateMergingComponent } from './duplicate-merging/duplicate-merging.component';

const routes: Routes = [
  {
    path: 'database-support',
    canActivate: [AuthGuard],
    children: [
      {path: '', component: DatabaseDashboardComponent},
      {path: 'data-editing', component: DataEditingComponent},
      {path: 'data-upload', component: DataUploadComponent},
      {path: 'db-support-console', component: DbSupportConsoleComponent},
      {path: 'db-support-dashboard', component: DatabaseDashboardComponent},
      {path: 'duplicate-merging', component: DuplicateMergingComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatabaseSupportRoutingModule {
}
