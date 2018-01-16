import {NgModule} from '@angular/core';

import {SharedModule} from '../shared/shared.module';

import {GroupsComponent} from './groups/groups.component';
import {UsersComponent} from './users/users.component';
import {RolesComponent} from './roles/roles.component';
import {UserDetailComponent} from './user-detail/user-detail.component';
import {RoleDetailComponent} from './role-detail/role-detail.component';
import {AdminComponent} from './admin/admin.component';
import {AdministrationRoutingModule} from './administration-routing.module';

@NgModule({
  imports: [
    SharedModule,
    AdministrationRoutingModule
  ],
  declarations: [
    GroupsComponent,
    RoleDetailComponent,
    RolesComponent,
    UserDetailComponent,
    UsersComponent,
    AdminComponent
  ]
})
export class AdministrationModule {
}
