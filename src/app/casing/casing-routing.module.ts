import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';
import { CasingDashboardComponent } from './casing-dashboard/casing-dashboard.component';
import { CasingComponent } from './casing/casing.component';

const routes: Routes = [
  {
    path: 'casing',
    component: CasingComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', component: CasingDashboardComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CasingRoutingModule {
}
