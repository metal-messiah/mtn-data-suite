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
import { NewProjectNameComponent } from './new-project-name/new-project-name.component';
import { DbLocationInfoCardComponent } from './db-location-info-card/db-location-info-card.component';
import { FileInputComponent } from './file-input/file-input.component';
import { TabSelectDialogComponent } from './file-input/tab-select-dialog/tab-select-dialog.component';
import { ThousandsCurrencyPipe } from './pipes/thousands-currency.pipe';
import { GoogleInfoCardComponent } from './google-info-card/google-info-card.component';
import { FuzzySearchComponent } from './fuzzy-search/fuzzy-search.component';

@NgModule({
  imports: [CommonModule, CustomMaterialModule, RouterModule, ReactiveFormsModule],
  declarations: [
    AppInfoDialogComponent,
    CallbackComponent,
    ConfirmDialogComponent,
    DataFieldComponent,
    DataFieldInfoDialogComponent,
    DbLocationInfoCardComponent,
    ErrorDialogComponent,
    FileInputComponent,
    FuzzySearchComponent,
    GoogleInfoCardComponent,
    LogoMenuComponent,
    MapComponent,
    NewProjectNameComponent,
    PathNotFoundComponent,
    TabSelectDialogComponent,
    ThousandsCurrencyPipe,
    UserProfileSelectComponent
  ],
  providers: [
    BreakpointObserver,
    DatePipe,
    MediaMatcher
  ],
  entryComponents: [
    AppInfoDialogComponent,
    ConfirmDialogComponent,
    DataFieldInfoDialogComponent,
    ErrorDialogComponent,
    NewProjectNameComponent,
    TabSelectDialogComponent,
    UserProfileSelectComponent
  ],
  exports: [
    CallbackComponent,
    CommonModule,
    CustomMaterialModule,
    DataFieldComponent,
    DataFieldInfoDialogComponent,
    DatePipe,
    DbLocationInfoCardComponent,
    FileInputComponent,
    FormsModule,
    FuzzySearchComponent,
    HttpClientModule,
    LogoMenuComponent,
    MapComponent,
    PathNotFoundComponent,
    ReactiveFormsModule,
    ThousandsCurrencyPipe
  ]
})
export class SharedModule {
}
