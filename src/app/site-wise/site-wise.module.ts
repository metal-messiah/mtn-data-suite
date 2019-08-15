import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { SiteWiseComponent } from './site-wise.component';
import { SiteWiseRoutingModule } from './site-wise-routing.module';

@NgModule({
  imports: [
    SiteWiseRoutingModule,
    SharedModule
  ],
  declarations: [SiteWiseComponent]
})
export class SiteWiseModule { }
