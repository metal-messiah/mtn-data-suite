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
import { ChainXyTableComponent } from './chain-xy/chain-xy-table/chain-xy-table.component';

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
		ChainXyTableComponent
	],
	entryComponents: [ AssignFieldsDialogComponent, LoadComponent, AutomatchDialogComponent ],
	providers: [ SpreadsheetService ]
})
export class DataUploadModule {}
