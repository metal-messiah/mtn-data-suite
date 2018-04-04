import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';
import { DbDashboardComponent } from './db-support-dashboard/db-dashboard.component';
import { DbSupportConsoleComponent } from './db-support-console/db-support-console.component';

const routes: Routes = [
  {
    path: 'database-support',
    canActivate: [AuthGuard],
    children: [
      {path: '', component: DbDashboardComponent},
      {path: 'db-support-console', component: DbSupportConsoleComponent},
      {path: 'db-support-dashboard', component: DbDashboardComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DbSupportRoutingModule {
}
