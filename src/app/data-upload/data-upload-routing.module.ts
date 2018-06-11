import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "../core/services/auth.guard";

import { DataUploadComponent } from "./data-upload.component";
import { OptionsMenuComponent } from "./options-menu/options-menu.component";

const routes: Routes = [
  {
    path: 'data-upload',
    component: DataUploadComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: OptionsMenuComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataUploadRoutingModule {}
