import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';
import { DbSupportDashboardComponent } from './db-support-dashboard/db-support-dashboard.component';
import { DbSupportConsoleComponent } from './db-support-console/db-support-console.component';
import { DbSupportComponent } from './db-support.component';

const routes: Routes = [
  {
    path: 'database-support',
    component: DbSupportComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', component: DbSupportDashboardComponent},
      {path: 'db-support-console', component: DbSupportConsoleComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DbSupportRoutingModule {
}
