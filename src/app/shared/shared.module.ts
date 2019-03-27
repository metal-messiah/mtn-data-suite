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
import { StoreInfoCardComponent } from './store-info-card/store-info-card.component';
import { SiteInfoCardComponent } from './site-info-card/site-info-card.component';
import { FileInputComponent } from './file-input/file-input.component';
import { TabSelectDialogComponent } from './file-input/tab-select-dialog/tab-select-dialog.component';
import { ThousandsCurrencyPipe } from './pipes/thousands-currency.pipe';
import { FuzzySearchComponent } from './fuzzy-search/fuzzy-search.component';
import { ListManagerDialogComponent } from './list-manager-dialog/list-manager-dialog.component';
// import { ListManagerService } from './list-manager-dialog/list-manager.service';
import { StorelistListItemComponent } from './list-manager-dialog/storelist-list-item/storelist-list-item.component';
import { StorelistStoresListComponent } from './list-manager-dialog/storelist-stores-list/storelist-stores-list.component';
import { ListManagerModule } from './list-manager-dialog/list-manager.module';

@NgModule({
    imports: [ CommonModule, CustomMaterialModule, RouterModule, ReactiveFormsModule ],
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
        AppInfoDialogComponent,
        NewProjectNameComponent,
        StoreInfoCardComponent,
        SiteInfoCardComponent,
        FileInputComponent,
        TabSelectDialogComponent,
        ThousandsCurrencyPipe,
        FuzzySearchComponent,
        ListManagerDialogComponent,
        StorelistListItemComponent,
        StorelistStoresListComponent
    ],
    providers: [ BreakpointObserver, DatePipe, MediaMatcher ],
    entryComponents: [
        ErrorDialogComponent,
        ConfirmDialogComponent,
        UserProfileSelectComponent,
        DataFieldInfoDialogComponent,
        AppInfoDialogComponent,
        NewProjectNameComponent,
        TabSelectDialogComponent,
        ListManagerDialogComponent
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
        DataFieldInfoDialogComponent,
        StoreInfoCardComponent,
        SiteInfoCardComponent,
        FileInputComponent,
        ThousandsCurrencyPipe,
        FuzzySearchComponent,
        ListManagerModule
    ]
})
export class SharedModule {}
