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
import { ListManagerDialogComponent } from './list-manager-dialog/list-manager-dialog.component';
import { StorelistListItemComponent } from './list-manager-dialog/storelist-list-item/storelist-list-item.component';
import { StorelistStoresListComponent } from './list-manager-dialog/storelist-stores-list/storelist-stores-list.component';
import { ListManagerModule } from './list-manager-dialog/list-manager.module';
import { StorelistSubscribersListComponent } from './list-manager-dialog/storelist-subscribers-list/storelist-subscribers-list.component';

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
    FuzzySearchComponent,
    GoogleInfoCardComponent,
    ListManagerDialogComponent,
    LogoMenuComponent,
    MapComponent,
    NewProjectNameComponent,
    PathNotFoundComponent,
    StorelistListItemComponent,
    StorelistStoresListComponent,
    StorelistSubscribersListComponent,
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
    ListManagerDialogComponent,
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
    ListManagerModule,
    LogoMenuComponent,
    MapComponent,
    PathNotFoundComponent,
    ReactiveFormsModule,
    ThousandsCurrencyPipe
  ]
})
export class SharedModule {
}
