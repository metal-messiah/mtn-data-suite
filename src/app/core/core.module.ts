import {NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from './services/auth.service';
import {ErrorService} from './services/error.service';
import {RestService} from './services/rest.service';
import {GroupService} from './services/group.service';
import {PermissionService} from './services/permission.service';
import {RoleService} from './services/role.service';
import {UserService} from './services/user.service';
import {AuthGuard} from './services/auth.guard';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    AuthService,
    AuthGuard,
    ErrorService,
    GroupService,
    PermissionService,
    RestService,
    RoleService,
    UserService
  ]
})
export class CoreModule {
  constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
