import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { DbSupportRoutingModule } from './db-support-routing.module';
import { DbSupportDashboardComponent } from './db-support-dashboard/db-support-dashboard.component';
import { DbSupportConsoleComponent } from './db-support-console/db-support-console.component';
import { DbSupportComponent } from './db-support.component';
import { MapService } from '../core/services/map.service';
import { DbSupportActivitySelectionComponent } from './db-support-activity-selection/db-support-activity-selection.component';
import { DbSupportDuplicatesComponent } from './db-support-duplicates/db-support-duplicates.component';
import { DbSupportMissingDataComponent } from './db-support-missing-data/db-support-missing-data.component';
import { DbSupportOutliersComponent } from './db-support-outliers/db-support-outliers.component';

@NgModule({
  imports: [
    SharedModule,
    DbSupportRoutingModule
  ],
  declarations: [
    DbSupportDashboardComponent,
    DbSupportConsoleComponent,
    DbSupportComponent,
    DbSupportActivitySelectionComponent,
    DbSupportDuplicatesComponent,
    DbSupportMissingDataComponent,
    DbSupportOutliersComponent
  ],
  providers: [
    MapService
  ]
})

export class DbSupportModule {
}
