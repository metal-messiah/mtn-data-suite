import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DataUploadRoutingModule } from './data-upload-routing.module';
import { DataUploadComponent } from './data-upload.component';
import { OptionsMenuComponent } from './options-menu/options-menu.component';
import { PlannedGroceryComponent } from './planned-grocery/planned-grocery.component';
import { SpreadsheetComponent } from './spreadsheet/spreadsheet.component';
import { PgDataFormComponent } from './planned-grocery/pg-data-form/pg-data-form.component';

@NgModule({
  imports: [SharedModule, DataUploadRoutingModule],
  declarations: [
    DataUploadComponent,
    OptionsMenuComponent,
    PlannedGroceryComponent,
    SpreadsheetComponent,
    PgDataFormComponent
  ],
  entryComponents: [],
  providers: []
})
export class DataUploadModule {}
