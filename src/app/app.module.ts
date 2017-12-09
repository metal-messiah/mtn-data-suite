import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {CustomMaterialModule} from './custom-material.module';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ServiceWorkerModule} from '@angular/service-worker';

import {ROUTES} from './app.routes';

import {AppComponent} from './app.component';
import {CallbackComponent} from './callback/callback.component';
import {ErrorModalComponent} from './error-modal/error-modal.component';
import {GroupsComponent} from './groups/groups.component';
import {HomeComponent} from './home/home.component';
import {PathNotFoundComponent} from './path-not-found/path-not-found.component';
import {UserDetailComponent} from './user-detail/user-detail.component';
import {UsersComponent} from './users/users.component';
import {RolesComponent} from './roles/roles.component';
import {RoleDetailComponent} from './role-detail/role-detail.component';

import {AuthService} from './auth/auth.service';
import {GroupService} from './services/group.service';
import {UserService} from './services/user.service';
import {PermissionService} from './services/permission.service';
import {RestService} from './services/rest.service';
import {RoleService} from './services/role.service';

import {environment} from '../environments/environment';

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
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot(ROUTES),
    HttpClientModule,
    NgbModule.forRoot(),
    CustomMaterialModule,
    environment.production ? ServiceWorkerModule.register('/ngsw-worker.js') : []
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
export class AppModule {
}
