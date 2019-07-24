import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';

import { DataUploadComponent } from './data-upload.component';
import { OptionsMenuComponent } from './options-menu/options-menu.component';
import { ChainXyTableComponent } from './chain-xy-table/chain-xy-table.component';
import { DataUploadCloudinaryComponent } from './cloudinary/data-upload-cloudinary.component';
import { MatchingComponent } from './matching/matching.component';
import { StoreSourceLocationMatchComponent } from './store-source/store-source-location-match/store-source-location-match.component';
import { StoreSourceMapComponent } from './store-source/store-source-map.component';

const routes: Routes = [
  {
    path: 'data-upload',
    component: DataUploadComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', component: OptionsMenuComponent},
      {
        path: 'matching', component: MatchingComponent,
        children: [
          {path: 'match-location', component: StoreSourceLocationMatchComponent}
        ]
      },
      {path: 'cloudinary', component: DataUploadCloudinaryComponent},
      {path: 'chain-xy', component: ChainXyTableComponent},
      {path: 'update', component: StoreSourceMapComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataUploadRoutingModule {
}
