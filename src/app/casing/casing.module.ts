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
import { ShoppingCenterCasingDetailComponent } from './shopping-center-casing-detail/shopping-center-casing-detail.component';
import { StoreDetailComponent } from './store-detail/store-detail.component';
import { StoreEntityFormComponent } from './store-entity-form/store-entity-form.component';
import { ShoppingCenterSurveyFormComponent } from './shopping-center-survey-form/shopping-center-survey-form.component';
import { StoreOverviewComponent } from './store-overview/store-overview.component';
import { StoreCasingEntityFormComponent } from './store-casing-entity-form/store-casing-entity-form.component';
import { StoreSummaryCardComponent } from './store-summary-card/store-summary-card.component';
import { StoreInfoCardComponent } from './store-info-card/store-info-card.component';
import { StoreCasingsComponent } from './store-casings/store-casings.component';
import { ShoppingCenterCasingsComponent } from './shopping-center-casings/shopping-center-casings.component';
import { StoreStatusesDialogComponent } from './store-statuses-dialog/store-statuses-dialog.component';
import { StoreVolumeDialogComponent } from './store-volume-dialog/store-volume-dialog.component';
import { StoreCasingDetailComponent } from './store-casing-detail/store-casing-detail.component';
import { AreaCalculatorComponent } from './area-calculator/area-calculator.component';
import { StoreVolumesSelectionComponent } from './store-volumes-selection/store-volumes-selection.component';
import { TenantListDialogComponent } from './tenant-list-dialog/tenant-list-dialog.component';
import { AccessListDialogComponent } from './access-list-dialog/access-list-dialog.component';
import { CreateCasingDialogComponent } from './create-casing-dialog/create-casing-dialog.component';
import { QuadDialogComponent } from './quad-dialog/quad-dialog.component';
import { SiteInfoCardComponent } from './site-info-card/site-info-card.component';

@NgModule({
  imports: [
    SharedModule,
    CasingRoutingModule
  ],
  declarations: [
    CasingComponent,
    CasingDashboardComponent,
    CasingProjectsComponent,
    SelectProjectComponent,
    ProjectSummaryComponent,
    ProjectDetailComponent,
    SiteListComponent,
    SiteDetailComponent,
    SiteOverviewComponent,
    LatLngSearchComponent,
    GoogleSearchComponent,
    DatabaseSearchComponent,
    ShoppingCenterDetailComponent,
    ShoppingCenterCasingDetailComponent,
    StoreDetailComponent,
    StoreEntityFormComponent,
    ShoppingCenterSurveyFormComponent,
    StoreOverviewComponent,
    StoreCasingEntityFormComponent,
    StoreSummaryCardComponent,
    StoreInfoCardComponent,
    StoreCasingsComponent,
    ShoppingCenterCasingsComponent,
    StoreStatusesDialogComponent,
    StoreVolumeDialogComponent,
    StoreCasingDetailComponent,
    AreaCalculatorComponent,
    StoreVolumesSelectionComponent,
    TenantListDialogComponent,
    AccessListDialogComponent,
    CreateCasingDialogComponent,
    QuadDialogComponent,
    SiteInfoCardComponent
  ],
  entryComponents: [
    AccessListDialogComponent,
    AreaCalculatorComponent,
    CreateCasingDialogComponent,
    DatabaseSearchComponent,
    GoogleSearchComponent,
    LatLngSearchComponent,
    QuadDialogComponent,
    SelectProjectComponent,
    StoreStatusesDialogComponent,
    StoreVolumeDialogComponent,
    StoreVolumesSelectionComponent,
    TenantListDialogComponent
  ],
  providers: [CasingDashboardService]
})
export class CasingModule {
}

