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
import { StoresListComponent } from './stores-list/stores-list.component';
import { AddRemoveStoresListDialogComponent } from './add-remove-stores-list-dialog/add-remove-stores-list-dialog.component';
import { TextInputDialogComponent } from './text-input-dialog/text-input-dialog.component';
import { StoredControlsSelectionDialogComponent } from './stored-controls-selection-dialog/stored-controls-selection-dialog.component';
import { SimpleSelectDialogComponent } from './simple-select-dialog/simple-select-dialog.component';
import { SidenavMenuComponent } from './store-sidenav/sidenav-menu/sidenav-menu.component';
import { SidenavStoresOnMapComponent } from './store-sidenav/sidenav-stores-on-map/sidenav-stores-on-map.component';
import { SidenavUserListsComponent } from './store-sidenav/sidenav-user-lists/sidenav-user-lists.component';
import { SidenavStoresInListComponent } from './store-sidenav/sidenav-stores-in-list/sidenav-stores-in-list.component';
import { BoundaryDialogComponent } from './boundary-dialog/boundary-dialog.component';
import { MenuListComponent } from './menu-list/menu-list.component';
import { SubTitleBarComponent } from './sub-title-bar/sub-title-bar.component';
import { ItemSelectionDialogComponent } from './item-selection/item-selection-dialog.component';
import { DbEntityControlsComponent } from './db-entity-controls/db-entity-controls.component';
import { AuditingEntityFieldsComponent } from './auditing-entity-fields/auditing-entity-fields.component';
import { MapDialogComponent } from './map-dialog/map-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    CustomMaterialModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    AddRemoveStoresListDialogComponent,
    AppInfoDialogComponent,
    AuditingEntityFieldsComponent,
    CallbackComponent,
    ConfirmDialogComponent,
    DataFieldComponent,
    DataFieldInfoDialogComponent,
    DbEntityControlsComponent,
    DbLocationInfoCardComponent,
    ErrorDialogComponent,
    FileInputComponent,
    FuzzySearchComponent,
    GoogleInfoCardComponent,
    ItemSelectionDialogComponent,
    LogoMenuComponent,
    MapComponent,
    MenuListComponent,
    NewProjectNameComponent,
    PathNotFoundComponent,
    SidenavMenuComponent,
    SidenavStoresInListComponent,
    SidenavStoresOnMapComponent,
    SidenavUserListsComponent,
    SidenavStoresInListComponent,
    BoundaryDialogComponent,
    SimpleSelectDialogComponent,
    StoredControlsSelectionDialogComponent,
    StoresListComponent,
    SubTitleBarComponent,
    TabSelectDialogComponent,
    TextInputDialogComponent,
    ThousandsCurrencyPipe,
    UserProfileSelectComponent,
    MapDialogComponent
  ],
  providers: [
    BreakpointObserver,
    DatePipe,
    MediaMatcher
  ],
  entryComponents: [
    AddRemoveStoresListDialogComponent,
    AppInfoDialogComponent,
    ConfirmDialogComponent,
    DataFieldInfoDialogComponent,
    ErrorDialogComponent,
    ItemSelectionDialogComponent,
    NewProjectNameComponent,
    SimpleSelectDialogComponent,
    StoredControlsSelectionDialogComponent,
    TabSelectDialogComponent,
    TextInputDialogComponent,
    StoredControlsSelectionDialogComponent,
    SimpleSelectDialogComponent,
    BoundaryDialogComponent,
    UserProfileSelectComponent
  ],
  exports: [
    AddRemoveStoresListDialogComponent,
    AuditingEntityFieldsComponent,
    CallbackComponent,
    CommonModule,
    CustomMaterialModule,
    DataFieldComponent,
    DataFieldInfoDialogComponent,
    DatePipe,
    DbEntityControlsComponent,
    DbLocationInfoCardComponent,
    FileInputComponent,
    FormsModule,
    FuzzySearchComponent,
    HttpClientModule,
    ItemSelectionDialogComponent,
    LogoMenuComponent,
    MapComponent,
    MenuListComponent,
    PathNotFoundComponent,
    ReactiveFormsModule,
    StoresListComponent,
    AddRemoveStoresListDialogComponent,
    BoundaryDialogComponent,
    SubTitleBarComponent,
    ThousandsCurrencyPipe
  ]
})
export class SharedModule {
}
