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
import { ListManagerModule } from './list-manager/list-manager.module';
import { ListManagerService } from './list-manager/list-manager.service';
import { ListManagerComponent } from './list-manager/list-manager.component';
import { StorelistListItemComponent } from './list-manager/storelist-list-item/storelist-list-item.component';
import { StorelistSubscribersListComponent } from './list-manager/storelist-subscribers-list/storelist-subscribers-list.component';
import { StorelistStoresListComponent } from './list-manager/storelist-stores-list/storelist-stores-list.component';
import { StoresListComponent } from './stores-list/stores-list.component';
import { StoreSidenavComponent } from './store-sidenav/store-sidenav.component';
import { StoreSidenavService } from './store-sidenav/store-sidenav.service';
import { AddRemoveStoresListDialogComponent } from './add-remove-stores-list-dialog/add-remove-stores-list-dialog.component';
import { TextInputDialogComponent } from './text-input-dialog/text-input-dialog.component';
import { StoredControlsSelectionDialogComponent } from './stored-controls-selection-dialog/stored-controls-selection-dialog.component';
import { SimpleSelectDialogComponent } from './simple-select-dialog/simple-select-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    CustomMaterialModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ListManagerModule
  ],
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
    ListManagerComponent,
    LogoMenuComponent,
    MapComponent,
    NewProjectNameComponent,
    PathNotFoundComponent,
    StorelistListItemComponent,
    StorelistStoresListComponent,
    StorelistSubscribersListComponent,
    TabSelectDialogComponent,
    ThousandsCurrencyPipe,
    UserProfileSelectComponent,
    StoresListComponent,
    StoreSidenavComponent,
    AddRemoveStoresListDialogComponent,
    TextInputDialogComponent,
    StoredControlsSelectionDialogComponent,
    SimpleSelectDialogComponent
  ],
  providers: [
    BreakpointObserver,
    DatePipe,
    MediaMatcher,
    ListManagerService,
    StoreSidenavService
  ],
  entryComponents: [
    AppInfoDialogComponent,
    ConfirmDialogComponent,
    DataFieldInfoDialogComponent,
    ErrorDialogComponent,
    ListManagerComponent,
    NewProjectNameComponent,
    TabSelectDialogComponent,
    UserProfileSelectComponent,
    AddRemoveStoresListDialogComponent,
    TextInputDialogComponent,
    StoredControlsSelectionDialogComponent,
    SimpleSelectDialogComponent
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
    ThousandsCurrencyPipe,
    CustomMaterialModule,
    ListManagerComponent,
    StorelistListItemComponent,
    StorelistSubscribersListComponent,
    StorelistStoresListComponent,
    StoresListComponent,
    StoreSidenavComponent,
    AddRemoveStoresListDialogComponent
  ]
})
export class SharedModule {
}
