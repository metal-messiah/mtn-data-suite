import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';

import { GeocodingComponent } from './geocoding.component';

const routes: Routes = [
  {
    path: 'geocoding',
    component: GeocodingComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: GeocodingComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeocodingRoutingModule {}
