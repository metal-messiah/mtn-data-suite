import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../core/services/auth.guard';
import {DatabaseSupportComponent} from './database-support.component';

const routes: Routes = [
    {
      path: 'database-support',
      canActivate: [AuthGuard],
      children: [
        {path: '', component: DatabaseSupportComponent}
    ]
    }
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AdministrationRoutingModule {
  }
