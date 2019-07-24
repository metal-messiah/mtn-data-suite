import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DataUploadRoutingModule } from './data-upload-routing.module';
import { DataUploadComponent } from './data-upload.component';
import { OptionsMenuComponent } from './options-menu/options-menu.component';
import { DataUploadCloudinaryComponent } from './cloudinary/data-upload-cloudinary.component';
import { MatchingComponent } from './matching/matching.component';
import { StoreSourceLocationMatchComponent } from './store-source/store-source-location-match/store-source-location-match.component';
import { StoreSourceMapComponent } from './store-source/store-source-map.component';
import { StoreSourceDataFieldComponent } from './store-source/store-source-data-field/store-source-data-field.component';
import { StoreSourceDataFormComponent } from './store-source/store-source-data-form/store-source-data-form.component';
import { ChainXyTableComponent } from './chain-xy-table/chain-xy-table.component';

@NgModule({
  imports: [SharedModule, DataUploadRoutingModule],
  declarations: [
    DataUploadComponent,
    OptionsMenuComponent,
    ChainXyTableComponent,
    StoreSourceMapComponent,
    StoreSourceDataFormComponent,
    DataUploadCloudinaryComponent,
    StoreSourceMapComponent,
    StoreSourceDataFormComponent,
    MatchingComponent,
    StoreSourceDataFieldComponent,
    StoreSourceLocationMatchComponent
  ],
  entryComponents: [
    StoreSourceDataFormComponent
  ]
})
export class DataUploadModule {
}
