import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';
import { CasingDashboardComponent } from './casing-dashboard/casing-dashboard.component';
import { CasingComponent } from './casing.component';
import { CasingProjectsComponent } from './casing-projects/casing-projects.component';
import { CanDeactivateGuard } from '../core/services/can-deactivate.guard';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { SiteListComponent } from './site-list/site-list.component';
import { SiteDetailComponent } from './site-detail/site-detail.component';
import { SiteOverviewComponent } from './site-overview/site-overview.component';
import { ShoppingCenterDetailComponent } from './shopping-center-detail/shopping-center-detail.component';
import { StoreDetailComponent } from './store-detail/store-detail.component';
import { StoreCasingsComponent } from './store-casings/store-casings.component';
import { StoreCasingDetailComponent } from './store-casing-detail/store-casing-detail.component';
import { StoreSidenavComponent } from './store-sidenav/store-sidenav.component';

const routes: Routes = [
  {
    path: 'casing',
    component: CasingComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: CasingDashboardComponent },
      // { path: '', component: StoreSidenavComponent, outlet: 'storeSidenav' },
      { path: 'site-list', component: SiteListComponent },
      { path: 'site/:siteId', component: SiteOverviewComponent },
      { path: 'site/:siteId/edit', component: SiteDetailComponent, canDeactivate: [CanDeactivateGuard] },
      { path: 'store/:storeId', component: StoreDetailComponent, canDeactivate: [CanDeactivateGuard] },
      { path: 'store/:storeId/store-casings', component: StoreCasingsComponent },
      { path: 'store/:storeId/store-casings/:storeCasingId', component: StoreCasingDetailComponent, canDeactivate: [CanDeactivateGuard] },
      { path: 'shopping-center/:shoppingCenterId', component: ShoppingCenterDetailComponent, canDeactivate: [CanDeactivateGuard] },
      { path: 'projects', component: CasingProjectsComponent },
      { path: 'project/:projectId', component: ProjectDetailComponent, canDeactivate: [CanDeactivateGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CasingRoutingModule {
}
