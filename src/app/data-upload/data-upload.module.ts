import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DataUploadRoutingModule } from './data-upload-routing.module';
import { DataUploadComponent } from './data-upload.component';
import { OptionsMenuComponent } from './options-menu/options-menu.component';
import { PlannedGroceryComponent } from './planned-grocery/planned-grocery.component';
import { SpreadsheetComponent } from './spreadsheet/spreadsheet.component';
import { PgDataFormComponent } from './planned-grocery/pg-data-form/pg-data-form.component';
import { AssignFieldsDialogComponent } from './spreadsheet/assign-fields-dialog/assign-fields-dialog.component';
import { MatDialogModule } from '@angular/material';
import { SpreadsheetDataFormComponent } from './spreadsheet/spreadsheet-data-form/spreadsheet-data-form.component';
import { LoadComponent } from './spreadsheet/load/load.component';
import { SpreadsheetService } from './spreadsheet/spreadsheet.service';
import { AutomatchDialogComponent } from './spreadsheet/automatch-dialog/automatch-dialog.component';

@NgModule({
	imports: [ SharedModule, DataUploadRoutingModule, MatDialogModule ],
	declarations: [
		DataUploadComponent,
		OptionsMenuComponent,
		PlannedGroceryComponent,
		SpreadsheetComponent,
		PgDataFormComponent,
		SpreadsheetDataFormComponent,
		AssignFieldsDialogComponent,
		LoadComponent,
		AutomatchDialogComponent
	],
	entryComponents: [ AssignFieldsDialogComponent, LoadComponent ],
	providers: [ AssignFieldsDialogComponent, LoadComponent, SpreadsheetService ]
})
export class DataUploadModule {}
