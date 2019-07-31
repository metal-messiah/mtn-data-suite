import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { GroupsComponent } from './groups/groups.component';
import { UserProfilesComponent } from './users/user-profiles.component';
import { RolesComponent } from './roles/roles.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { RoleDetailComponent } from './role-detail/role-detail.component';
import { AdminComponent } from './admin.component';
import { AdministrationRoutingModule } from './administration-routing.module';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { AdminMenuComponent } from './admin-menu/admin-menu.component';
import { RolePermissionsComponent } from './role-permissions/role-permissions.component';

@NgModule({
  imports: [
    SharedModule,
    AdministrationRoutingModule
  ],
  entryComponents: [
    RolePermissionsComponent
  ],
  declarations: [
    AdminComponent,
    AdminMenuComponent,
    GroupDetailComponent,
    GroupsComponent,
    RoleDetailComponent,
    RolesComponent,
    UserDetailComponent,
    UserProfilesComponent,
    RolePermissionsComponent
  ]
})
export class AdministrationModule {
}
