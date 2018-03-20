import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { DatabaseSupportComponent } from './database-support.component';
import { AdministrationRoutingModule } from './database-support-routing.module';
import { DataEditingComponent } from './data-editing/data-editing.component';
import { MapComponent } from './data-editing/map/map.component';
import { ToolsComponent } from './data-editing/tools/tools.component';
import { DataUploadComponent } from './data-upload/data-upload.component';
import { DuplicateMergingComponent } from './duplicate-merging/duplicate-merging.component';

@NgModule({
  imports: [
    SharedModule,
    AdministrationRoutingModule
  ],
  declarations: [DatabaseSupportComponent, DataEditingComponent, MapComponent, ToolsComponent, DataUploadComponent, DuplicateMergingComponent]
})

export class DatabaseSupportModule { }
