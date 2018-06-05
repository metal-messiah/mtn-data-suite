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
import { StoreCasingsComponent } from './store-casings/store-casings.component';
import { ShoppingCenterCasingsComponent } from './shopping-center-casings/shopping-center-casings.component';
import { StoreCasingDetailComponent } from './store-casing-detail/store-casing-detail.component';

const routes: Routes = [
  {
    path: 'casing',
    component: CasingComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', component: CasingDashboardComponent},
      {path: 'site-list', component: SiteListComponent},
      {path: 'shopping-center-detail/:id', component: ShoppingCenterDetailComponent},
      {path: 'shopping-center-detail', component: ShoppingCenterDetailComponent},
      {path: 'store-detail/:id', component: StoreDetailComponent},
      {path: 'store-detail', component: StoreDetailComponent},
      {path: 'store/:storeId/store-casings', component: StoreCasingsComponent},
      {path: 'site/:id/edit', component: SiteDetailComponent},
      {path: 'site', component: SiteDetailComponent},
      {path: 'site/:siteId', component: SiteOverviewComponent},
      {path: 'store/:storeId/store-casing/:storeCasingId', component: StoreCasingDetailComponent},
      {path: 'store/:storeId/store-casing', component: StoreCasingDetailComponent},
      {path: 'shopping-center-casing-detail/:id', component: ShoppingCenterCasingDetailComponent},
      {path: 'shopping-center-casing-detail', component: ShoppingCenterCasingDetailComponent},
      {path: 'shopping-center/:shoppingCenterId/shopping-center-casings', component: ShoppingCenterCasingsComponent},
      {path: 'projects', component: CasingProjectsComponent},
      {path: 'project-summary/:projectId', component: ProjectSummaryComponent},
      {path: 'project-detail/:id', component: ProjectDetailComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'project-detail/', component: ProjectDetailComponent, canDeactivate: [CanDeactivateGuard]}]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CasingRoutingModule {
}
