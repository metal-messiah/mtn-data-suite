import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ROUTES } from './app.routes';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CallbackComponent } from './callback/callback.component';
import { UsersComponent } from './users/users.component';

import { AuthService } from './auth/auth.service';
import { UserService } from './services/user.service';
import {RoleService} from './services/role.service';
import {RestService} from './services/rest.service';
import {GroupService} from './services/group.service';
import { RolesComponent } from './roles/roles.component';
import { GroupsComponent } from './groups/groups.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { PathNotFoundComponent } from './path-not-found/path-not-found.component';
import { RoleDetailComponent } from './role-detail/role-detail.component';
import {PermissionService} from './services/permission.service';
import { ErrorModalComponent } from './error-modal/error-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CallbackComponent,
    UsersComponent,
    RolesComponent,
    GroupsComponent,
    UserDetailComponent,
    PathNotFoundComponent,
    RoleDetailComponent,
    ErrorModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(ROUTES),
    HttpClientModule,
    NgbModule.forRoot()
  ],
  providers: [
    AuthService,
    RestService,
    UserService,
    RoleService,
    GroupService,
    PermissionService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ErrorModalComponent
  ]
})
export class AppModule { }
