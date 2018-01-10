import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {CustomMaterialModule} from './material/custom-material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ServiceWorkerModule} from '@angular/service-worker';

import {ROUTES} from './app.routes';

import {AppComponent} from './app.component';
import {CallbackComponent} from './callback/callback.component';
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
import {BreakpointObserver, MediaMatcher} from '@angular/cdk/layout';
import {ErrorDialogComponent} from './error-dialog/error-dialog.component';
import {ErrorService} from './services/error.service';
import {DatePipe} from '@angular/common';

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
    ErrorDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(ROUTES),
    HttpClientModule,
    NgbModule.forRoot(),
    CustomMaterialModule,
    environment.production ? ServiceWorkerModule.register('/ngsw-worker.js') : []
  ],
  providers: [
    AuthService,
    BreakpointObserver,
    ErrorService,
    GroupService,
    MediaMatcher,
    PermissionService,
    RestService,
    RoleService,
    UserService,
    DatePipe
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ErrorDialogComponent
  ]
})
export class AppModule {
}
