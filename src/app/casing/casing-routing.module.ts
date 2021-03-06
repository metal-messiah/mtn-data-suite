import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';
import { CasingDashboardComponent } from './casing-dashboard/casing-dashboard.component';
import { CasingComponent } from './casing.component';
import { CanDeactivateGuard } from '../core/services/can-deactivate.guard';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { SiteDetailComponent } from './site-detail/site-detail.component';
import { SiteOverviewComponent } from './site-overview/site-overview.component';
import { ShoppingCenterDetailComponent } from './shopping-center-detail/shopping-center-detail.component';
import { StoreDetailComponent } from './store-detail/store-detail.component';
import { StoreCasingsComponent } from './store-casings/store-casings.component';
import { StoreCasingDetailComponent } from './store-casing-detail/store-casing-detail.component';
import { SidenavMenuComponent } from '../shared/store-sidenav/sidenav-menu/sidenav-menu.component';
import { SidenavStoresOnMapComponent } from '../shared/store-sidenav/sidenav-stores-on-map/sidenav-stores-on-map.component';
import { SidenavUserListsComponent } from '../shared/store-sidenav/sidenav-user-lists/sidenav-user-lists.component';
import { SidenavStoresInListComponent } from '../shared/store-sidenav/sidenav-stores-in-list/sidenav-stores-in-list.component';

const routes: Routes = [
  {
    path: 'casing',
    component: CasingComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: CasingDashboardComponent,
        children: [
          {path: '', component: SidenavMenuComponent},
          {path: 'map-stores', component: SidenavStoresOnMapComponent},
          {path: 'list-stores/:listId', component: SidenavStoresInListComponent},
          {path: 'my-store-lists', component: SidenavUserListsComponent},
        ]
      },
      {path: 'site/:siteId', component: SiteOverviewComponent},
      {path: 'site/:siteId/edit', component: SiteDetailComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'store/:storeId', component: StoreDetailComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'store/:storeId/store-casings', component: StoreCasingsComponent},
      {path: 'store/:storeId/store-casings/:storeCasingId', component: StoreCasingDetailComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'shopping-center/:shoppingCenterId', component: ShoppingCenterDetailComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'project/:projectId', component: ProjectDetailComponent, canDeactivate: [CanDeactivateGuard]}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CasingRoutingModule {
}
