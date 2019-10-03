import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteWiseComponent } from './site-wise.component';
import { AuthGuard } from '../core/services/auth.guard';

const routes: Routes = [
  {
    path: 'site-wise',
    component: SiteWiseComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteWiseRoutingModule {
}
