import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DbSupportRoutingModule } from './db-support-routing.module';
import { DbDashboardComponent } from './db-support-dashboard/db-dashboard.component';
import { DbSupportConsoleComponent } from './db-support-console/db-support-console.component';
import { DbSupportComponent } from './db-support.component';

@NgModule({
  imports: [
    SharedModule,
    DbSupportRoutingModule
  ],
  declarations: [
    DbDashboardComponent,
    DbSupportConsoleComponent,
    DbSupportComponent
  ]
})

export class DbSupportModule {
}
