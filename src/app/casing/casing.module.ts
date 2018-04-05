import {NgModule} from '@angular/core';
import {CasingDashboardComponent} from './casing-dashboard/casing-dashboard.component';
import {CasingComponent} from './casing.component';
import {SharedModule} from '../shared/shared.module';
import {CasingRoutingModule} from './casing-routing.module';
import { CasingProjectsComponent } from './casing-projects/casing-projects.component';
import { SelectProjectComponent } from './select-project/select-project.component';
import { ProjectSummaryComponent } from './project-summary/project-summary.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { SiteListComponent } from './site-list/site-list.component';
import { CasingDashboardService } from './casing-dashboard/casing-dashboard.service';
import { SiteDetailComponent } from './site-detail/site-detail.component';
import { LocationOverviewComponent } from './location-overview/location-overview.component';
import { SearchComponent } from './search/search.component';
import { GooglePlacesComponent } from './google-places/google-places.component';
import { DbSearchComponent } from './db-search/db-search.component';
import { LatLngSearchComponent } from './lat-lng-search/lat-lng-search.component';

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
    LocationOverviewComponent,
    SearchComponent,
    GooglePlacesComponent,
    DbSearchComponent,
    LatLngSearchComponent
  ],
  entryComponents: [
    SearchComponent,
    SelectProjectComponent
  ],
  providers: [CasingDashboardService]
})
export class CasingModule {
}
