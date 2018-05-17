import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';
import { CasingDashboardComponent } from './casing-dashboard/casing-dashboard.component';
import { CasingComponent } from './casing.component';
import { CasingProjectsComponent } from './casing-projects/casing-projects.component';
import { ProjectSummaryComponent } from './project-summary/project-summary.component';
import { CanDeactivateGuard } from '../core/services/can-deactivate.guard';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { SiteListComponent } from './site-list/site-list.component';
import { SiteDetailComponent } from './site-detail/site-detail.component';
import { SiteOverviewComponent } from './site-overview/site-overview.component';
import { ShoppingCenterDetailComponent } from './shopping-center-detail/shopping-center-detail.component';
import { ShoppingCenterCasingDetailComponent } from './shopping-center-casing-detail/shopping-center-casing-detail.component';
import { StoreDetailComponent } from './store-detail/store-detail.component';

const routes: Routes = [
  {
    path: 'casing',
    component: CasingComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', component: CasingDashboardComponent},
      {path: 'site-list', component: SiteListComponent},
      {path: 'site-detail/:id', component: SiteDetailComponent},
      {path: 'site-detail', component: SiteDetailComponent},
      {path: 'shopping-center-detail/:id', component: ShoppingCenterDetailComponent},
      {path: 'shopping-center-detail', component: ShoppingCenterDetailComponent},
      {path: 'store-detail/:id', component: StoreDetailComponent},
      {path: 'store-detail', component: StoreDetailComponent},
      {path: 'shopping-center-storeCasing-detail/:id', component: ShoppingCenterCasingDetailComponent},
      {path: 'shopping-center-storeCasing-detail', component: ShoppingCenterCasingDetailComponent},
      {path: 'projects', component: CasingProjectsComponent},
      {path: 'project-summary/:projectId', component: ProjectSummaryComponent},
      {path: 'project-detail/:id', component: ProjectDetailComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'project-detail/', component: ProjectDetailComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'site-overview/:siteId', component: SiteOverviewComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CasingRoutingModule {
}
