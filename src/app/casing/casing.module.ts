import { NgModule } from '@angular/core';
import { CasingDashboardComponent } from './casing-dashboard/casing-dashboard.component';
import { CasingComponent } from './casing.component';
import { SharedModule } from '../shared/shared.module';
import { CasingRoutingModule } from './casing-routing.module';
import { CasingProjectsComponent } from './store-casing-detail/casing-projects/casing-projects.component';
import { SelectProjectComponent } from './select-project/select-project.component';
import { ProjectSummaryComponent } from './project-summary/project-summary.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
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
import { CasingDateComponent } from './store-casing-detail/casing-date/casing-date.component';
import { VisibilityComponent } from './store-casing-detail/visibility/visibility.component';
import { AccessibilityComponent } from './store-casing-detail/accessibility/accessibility.component';
import { FlowComponent } from './store-casing-detail/flow/flow.component';
import { StoreParkingComponent } from './store-casing-detail/store-parking/store-parking.component';
import { TenantsComponent } from './store-casing-detail/tenants/tenants.component';
import { FuelComponent } from './store-casing-detail/fuel/fuel.component';
import { StoreStatusComponent } from './store-casing-detail/store-status/store-status.component';
import { FitFormatComponent } from './store-casing-detail/fit-format/fit-format.component';
import { HoursComponent } from './store-casing-detail/hours/hours.component';
import { StoreConditionComponent } from './store-casing-detail/store-condition/store-condition.component';
import { PharmacyComponent } from './store-casing-detail/pharmacy/pharmacy.component';
import { RegistersComponent } from './store-casing-detail/registers/registers.component';
import { DepartmentsComponent } from './store-casing-detail/departments/departments.component';
import { AreaComponent } from './store-casing-detail/area/area.component';
import { CasingVolumeComponent } from './store-casing-detail/casing-volume/casing-volume.component';
import { SeasonalityComponent } from './store-casing-detail/seasonality/seasonality.component';
import { CasingNotesComponent } from './store-casing-detail/casing-notes/casing-notes.component';

@NgModule({
  imports: [
    CasingRoutingModule,
    SharedModule
  ],
  declarations: [
    AccessibilityComponent,
    AccessListDialogComponent,
    AreaCalculatorComponent,
    AreaComponent,
    CasingComponent,
    CasingDashboardComponent,
    CasingDateComponent,
    CasingNotesComponent,
    CasingProjectsComponent,
    CasingVolumeComponent,
    DatabaseSearchComponent,
    DepartmentsComponent,
    DownloadDialogComponent,
    FitFormatComponent,
    FlowComponent,
    FuelComponent,
    GoogleSearchComponent,
    HoursComponent,
    InfoCardComponent,
    InfoCardDirective,
    LatLngSearchComponent,
    NewStoreStatusComponent,
    NewStoreVolumeComponent,
    PharmacyComponent,
    ProjectDetailComponent,
    ProjectSummaryComponent,
    QuadDialogComponent,
    RegistersComponent,
    SeasonalityComponent,
    SelectBannerComponent,
    SelectProjectComponent,
    ShoppingCenterDetailComponent,
    SiteDetailComponent,
    SiteMergeDialogComponent,
    SiteOverviewComponent,
    StoreAttrSelectionDialogComponent,
    StoreCasingDetailComponent,
    StoreCasingsComponent,
    StoreConditionComponent,
    StoreDetailComponent,
    StoreParkingComponent,
    StoreSelectionDialogComponent,
    StoreStatusComponent,
    StoreStatusesDialogComponent,
    StoreSummaryCardComponent,
    StoreVolumeDialogComponent,
    StoreVolumesSelectionComponent,
    TenantListDialogComponent,
    TenantsComponent,
    VisibilityComponent
  ],
  entryComponents: [
    AccessListDialogComponent,
    AreaCalculatorComponent,
    DatabaseSearchComponent,
    DbLocationInfoCardComponent,
    DownloadDialogComponent,
    GoogleInfoCardComponent,
    GoogleSearchComponent,
    LatLngSearchComponent,
    NewStoreStatusComponent,
    NewStoreVolumeComponent,
    QuadDialogComponent,
    SelectBannerComponent,
    SelectProjectComponent,
    SiteMergeDialogComponent,
    StoreAttrSelectionDialogComponent,
    StoreSelectionDialogComponent,
    StoreStatusesDialogComponent,
    StoreVolumeDialogComponent,
    StoreVolumesSelectionComponent,
    TenantListDialogComponent
  ]
})
export class CasingModule {
}

