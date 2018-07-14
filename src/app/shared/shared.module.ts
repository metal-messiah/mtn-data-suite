import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { CustomMaterialModule } from './material/custom-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { CallbackComponent } from './callback/callback.component';
import { PathNotFoundComponent } from './path-not-found/path-not-found.component';
import { MapComponent } from './map/map.component';
import { LogoMenuComponent } from './logo-menu/logo-menu.component';
import { RouterModule } from '@angular/router';
import { DataFieldComponent } from './data-field/data-field.component';
import { UserProfileSelectComponent } from './user-profile-select/user-profile-select.component';
import { DataFieldInfoDialogComponent } from './data-field-info-dialog/data-field-info-dialog.component';
import { AppInfoDialogComponent } from './app-info-dialog/app-info-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    CustomMaterialModule,
    RouterModule
  ],
  declarations: [
    ErrorDialogComponent,
    ConfirmDialogComponent,
    CallbackComponent,
    PathNotFoundComponent,
    MapComponent,
    LogoMenuComponent,
    DataFieldComponent,
    UserProfileSelectComponent,
    DataFieldInfoDialogComponent,
    AppInfoDialogComponent
  ],
  providers: [
    BreakpointObserver,
    DatePipe,
    MediaMatcher
  ],
  entryComponents: [
    ErrorDialogComponent,
    ConfirmDialogComponent,
    UserProfileSelectComponent,
    DataFieldInfoDialogComponent,
    AppInfoDialogComponent
  ],
  exports: [
    CallbackComponent,
    CommonModule,
    CustomMaterialModule,
    DatePipe,
    FormsModule,
    HttpClientModule,
    LogoMenuComponent,
    MapComponent,
    PathNotFoundComponent,
    ReactiveFormsModule,
    DataFieldComponent,
    DataFieldInfoDialogComponent
  ]
})
export class SharedModule {
}
