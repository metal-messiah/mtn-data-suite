import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';

import { BrokerageComponent } from './brokerage.component';
import { ImagesComponent } from './images/images.component';
import { BrokerageMenuComponent } from './brokerage-menu/brokerage-menu.component';
// import { OptionsMenuComponent } from './options-menu/options-menu.component';
// import { PlannedGroceryComponent } from './planned-grocery/planned-grocery.component';
// import { SpreadsheetComponent } from './spreadsheet/spreadsheet.component';

const routes: Routes = [
  {
    path: 'brokerage',
    component: BrokerageComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: BrokerageMenuComponent },
      { path: 'images', component: ImagesComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrokerageRoutingModule {}
