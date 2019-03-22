import { NgModule } from '@angular/core';
import { CasingDashboardComponent } from './casing-dashboard/casing-dashboard.component';
import { CasingComponent } from './casing.component';
import { SharedModule } from '../shared/shared.module';
import { CasingRoutingModule } from './casing-routing.module';
import { CasingProjectsComponent } from './casing-projects/casing-projects.component';
import { SelectProjectComponent } from './select-project/select-project.component';
import { ProjectSummaryComponent } from './project-summary/project-summary.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { SiteListComponent } from './site-list/site-list.component';
import { CasingDashboardService } from './casing-dashboard/casing-dashboard.service';
import { SiteDetailComponent } from './site-detail/site-detail.component';
import { SiteOverviewComponent } from './site-overview/site-overview.component';
import { LatLngSearchComponent } from './lat-lng-search/lat-lng-search.component';
import { GoogleSearchComponent } from './google-search/google-search.component';
import { DatabaseSearchComponent } from './database-search/database-search.component';
import { ShoppingCenterDetailComponent } from './shopping-center-detail/shopping-center-detail.component';
import { StoreDetailComponent } from './store-detail/store-detail.component';
import { StoreSummaryCardComponent } from './store-summary-card/store-summary-card.component';
import { StoreCasingsComponent } from './store-casings/store-casings.component';
import { StoreStatusesDialogComponent } from './store-statuses-dialog/store-statuses-dialog.component';
import { StoreVolumeDialogComponent } from './store-volume-dialog/store-volume-dialog.component';
import { StoreCasingDetailComponent } from './store-casing-detail/store-casing-detail.component';
import { AreaCalculatorComponent } from './area-calculator/area-calculator.component';
import { StoreVolumesSelectionComponent } from './store-volumes-selection/store-volumes-selection.component';
import { TenantListDialogComponent } from './tenant-list-dialog/tenant-list-dialog.component';
import { AccessListDialogComponent } from './access-list-dialog/access-list-dialog.component';
import { QuadDialogComponent } from './quad-dialog/quad-dialog.component';
import { NewStoreStatusComponent } from './new-store-status/new-store-status.component';
import { NewStoreVolumeComponent } from './new-store-volume/new-store-volume.component';
import { DownloadDialogComponent } from './download-dialog/download-dialog.component';
import { SiteMergeDialogComponent } from './site-merge-dialog/site-merge-dialog.component';
import { StoreSelectionDialogComponent } from './store-merge/store-selection-dialog/store-selection-dialog.component';
import { StoreAttrSelectionDialogComponent } from './store-merge/store-attr-selection-dialog/store-attr-selection-dialog.component';
import { SelectBannerComponent } from './select-banner/select-banner.component';
import { InfoCardDirective } from './info-card.directive';
import { InfoCardComponent } from './info-card/info-card.component';
import { DbLocationInfoCardComponent } from '../shared/db-location-info-card/db-location-info-card.component';
import { GoogleInfoCardComponent } from '../shared/google-info-card/google-info-card.component';

@NgModule({
  imports: [
    SharedModule,
    CasingRoutingModule
  ],
  declarations: [
    AccessListDialogComponent,
    AreaCalculatorComponent,
    CasingComponent,
    CasingDashboardComponent,
    CasingProjectsComponent,
    DatabaseSearchComponent,
    GoogleSearchComponent,
    LatLngSearchComponent,
    NewStoreStatusComponent,
    ProjectDetailComponent,
    ProjectSummaryComponent,
    QuadDialogComponent,
    SelectProjectComponent,
    ShoppingCenterDetailComponent,
    SiteDetailComponent,
    SiteListComponent,
    SiteOverviewComponent,
    StoreCasingDetailComponent,
    StoreCasingsComponent,
    StoreDetailComponent,
    StoreStatusesDialogComponent,
    StoreSummaryCardComponent,
    StoreVolumeDialogComponent,
    StoreVolumesSelectionComponent,
    TenantListDialogComponent,
    NewStoreVolumeComponent,
    DownloadDialogComponent,
    SiteMergeDialogComponent,
    StoreSelectionDialogComponent,
    StoreAttrSelectionDialogComponent,
    SelectBannerComponent,
    InfoCardDirective,
    InfoCardComponent
  ],
  entryComponents: [
    AccessListDialogComponent,
    AreaCalculatorComponent,
    DatabaseSearchComponent,
    GoogleSearchComponent,
    LatLngSearchComponent,
    QuadDialogComponent,
    SelectProjectComponent,
    StoreStatusesDialogComponent,
    StoreVolumeDialogComponent,
    StoreVolumesSelectionComponent,
    TenantListDialogComponent,
    NewStoreStatusComponent,
    NewStoreVolumeComponent,
    DownloadDialogComponent,
    SiteMergeDialogComponent,
    StoreSelectionDialogComponent,
    StoreAttrSelectionDialogComponent,
    SelectBannerComponent,
    DbLocationInfoCardComponent,
    GoogleInfoCardComponent
  ],
  providers: [CasingDashboardService]
})
export class CasingModule {
}

