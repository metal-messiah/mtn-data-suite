import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DbSupportRoutingModule } from './db-support-routing.module';
import { DbSupportDashboardComponent } from './db-support-dashboard/db-support-dashboard.component';
import { DbSupportConsoleComponent } from './db-support-console/db-support-console.component';
import { DbSupportComponent } from './db-support.component';
import { MapService } from '../core/services/map.service';

@NgModule({
  imports: [
    SharedModule,
    DbSupportRoutingModule
  ],
  declarations: [
    DbSupportDashboardComponent,
    DbSupportConsoleComponent,
    DbSupportComponent
  ],
  providers: [
    MapService
  ]
})

export class DbSupportModule {
}
