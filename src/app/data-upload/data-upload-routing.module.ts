import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';

import { DataUploadComponent } from './data-upload.component';
import { OptionsMenuComponent } from './options-menu/options-menu.component';
import { PlannedGroceryComponent } from './planned-grocery/planned-grocery.component';
import { SpreadsheetComponent } from './spreadsheet/spreadsheet.component';
import { ChainXyComponent } from './chain-xy/chain-xy.component';
import { ChainXyTableComponent } from './chain-xy/chain-xy-table/chain-xy-table.component';

const routes: Routes = [
	{
		path: 'data-upload',
		component: DataUploadComponent,
		canActivate: [ AuthGuard ],
		children: [
			{ path: '', component: OptionsMenuComponent },
			{ path: 'planned-grocery', component: PlannedGroceryComponent },
			{ path: 'spreadsheet', component: SpreadsheetComponent },
			{
				path: 'chain-xy',
				component: ChainXyComponent,
				children: [ { path: '', component: ChainXyTableComponent } ]
			}
		]
	}
];

@NgModule({
	imports: [ RouterModule.forChild(routes) ],
	exports: [ RouterModule ]
})
export class DataUploadRoutingModule {}
