import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DatabaseSupportRoutingModule } from './database-support-routing.module';
import { DataEditingComponent } from './data-editing/data-editing.component';
import { DataUploadComponent } from './data-upload/data-upload.component';
import { DatabaseDashboardComponent } from './db-support-dashboard/database-dashboard.component';
import { DuplicateMergingComponent } from './duplicate-merging/duplicate-merging.component';
import { MapComponent } from './data-editing/map/map.component';
import { ToolsComponent } from './data-editing/tools/tools.component';
import { DbSupportConsoleComponent } from './db-support-console/db-support-console.component';

@NgModule({
  imports: [
    SharedModule,
    DatabaseSupportRoutingModule
  ],
  declarations: [
    DataEditingComponent,
    DataUploadComponent,
    DatabaseDashboardComponent,
    DuplicateMergingComponent,
    MapComponent, // TODO Am I using your map service in shared? Or ... ?
    ToolsComponent,
    DbSupportConsoleComponent
  ]
})

export class DatabaseSupportModule {
}
