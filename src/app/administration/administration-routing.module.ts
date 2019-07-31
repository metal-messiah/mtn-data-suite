import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserProfilesComponent } from './users/user-profiles.component';
import { GroupsComponent } from './groups/groups.component';
import { RoleDetailComponent } from './role-detail/role-detail.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { RolesComponent } from './roles/roles.component';
import { AdminComponent } from './admin.component';
import { AuthGuard } from '../core/services/auth.guard';
import { CanDeactivateGuard } from '../core/services/can-deactivate.guard';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { AdminMenuComponent } from './admin-menu/admin-menu.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', component: AdminMenuComponent},
      {path: 'groups', component: GroupsComponent},
      {path: 'roles', component: RolesComponent},
      {path: 'users', component: UserProfilesComponent},
      {path: 'role-detail', component: RoleDetailComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'role-detail/:id', component: RoleDetailComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'user-detail', component: UserDetailComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'user-detail/:id', component: UserDetailComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'group-detail', component: GroupDetailComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'group-detail/:id', component: GroupDetailComponent, canDeactivate: [CanDeactivateGuard]}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule {
}
