import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DataUploadRoutingModule } from './data-upload-routing.module';
import { DataUploadComponent } from './data-upload.component';
import { OptionsMenuComponent } from './options-menu/options-menu.component';
import { PlannedGroceryComponent } from './planned-grocery/planned-grocery.component';
import { SpreadsheetComponent } from './spreadsheet/spreadsheet.component';
import { PgDataFormComponent } from './planned-grocery/pg-data-form/pg-data-form.component';
import { AssignFieldsDialogComponent } from './spreadsheet/assign-fields-dialog/assign-fields-dialog.component';
import { SpreadsheetDataFormComponent } from './spreadsheet/spreadsheet-data-form/spreadsheet-data-form.component';
import { LoadComponent } from './spreadsheet/load/load.component';
import { SpreadsheetService } from './spreadsheet/spreadsheet.service';
import { AutomatchDialogComponent } from './spreadsheet/automatch-dialog/automatch-dialog.component';
import { ChainXyComponent } from './chain-xy/chain-xy.component';
import { ChainXyService } from './chain-xy/chain-xy.service';
import { ChainXyTableComponent } from './chain-xy/chain-xy-table/chain-xy-table.component';
import { ChainXyMapComponent } from './chain-xy/chain-xy-map/chain-xy-map.component';
import { ChainXyDataFormComponent } from './chain-xy/chain-xy-map/chain-xy-data-form/chain-xy-data-form.component';
import { CloudinaryComponent } from './cloudinary/cloudinary.component';

@NgModule({
    imports: [ SharedModule, DataUploadRoutingModule ],
    declarations: [
        DataUploadComponent,
        OptionsMenuComponent,
        PlannedGroceryComponent,
        SpreadsheetComponent,
        PgDataFormComponent,
        SpreadsheetDataFormComponent,
        AssignFieldsDialogComponent,
        LoadComponent,
        AutomatchDialogComponent,
        ChainXyComponent,
        ChainXyTableComponent,
        ChainXyMapComponent,
        ChainXyDataFormComponent,
        CloudinaryComponent
    ],
    entryComponents: [ AssignFieldsDialogComponent, LoadComponent, AutomatchDialogComponent ],
    providers: [ SpreadsheetService, ChainXyService ]
})
export class DataUploadModule {}
