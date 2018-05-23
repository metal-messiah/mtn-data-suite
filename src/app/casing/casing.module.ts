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
    StoreInfoCardComponent
  ],
  entryComponents: [
    LatLngSearchComponent,
    GoogleSearchComponent,
    DatabaseSearchComponent,
    SelectProjectComponent
  ],
  providers: [CasingDashboardService]
})
export class CasingModule {
}

