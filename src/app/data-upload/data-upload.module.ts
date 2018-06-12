import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { DataUploadRoutingModule } from "./data-upload-routing.module";
import { DataUploadComponent } from "./data-upload.component";
import { OptionsMenuComponent } from "./options-menu/options-menu.component";
import { PlannedGroceryComponent } from "./planned-grocery/planned-grocery.component";

@NgModule({
  imports: [SharedModule, DataUploadRoutingModule],
  declarations: [
    DataUploadComponent,
    OptionsMenuComponent,
    PlannedGroceryComponent
  ],
  entryComponents: [],
  providers: []
})
export class DataUploadModule {}
