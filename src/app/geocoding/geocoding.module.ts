import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { GeocodingRoutingModule } from './geocoding-routing.module';
import { GeocodingComponent } from './geocoding.component';
import { MatDialogModule } from '@angular/material';
import { ResourceQuotaService } from '../core/services/resource-quota.service';

@NgModule({
  imports: [SharedModule, GeocodingRoutingModule, MatDialogModule],
  declarations: [
    GeocodingComponent
  ],
  entryComponents: [],
  providers: [ResourceQuotaService]
})
export class GeocodingModule {}
