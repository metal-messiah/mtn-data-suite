import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';

import { ReportsComponent } from './reports.component';
import { ReportUploadComponent } from './report-upload/report-upload.component';
// import { OptionsMenuComponent } from './options-menu/options-menu.component';
// import { PlannedGroceryComponent } from './planned-grocery/planned-grocery.component';
// import { SpreadsheetComponent } from './spreadsheet/spreadsheet.component';

const routes: Routes = [
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: ReportUploadComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule {}
