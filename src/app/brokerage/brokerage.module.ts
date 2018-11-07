import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { BrokerageRoutingModule } from './brokerage-routing.module';
import { BrokerageComponent } from './brokerage.component';
import { ImagesComponent } from './images/images.component';
import { BrokerageMenuComponent } from './brokerage-menu/brokerage-menu.component';

@NgModule({
  imports: [SharedModule, BrokerageRoutingModule],
  declarations: [BrokerageComponent, ImagesComponent, BrokerageMenuComponent],
  entryComponents: [],
  providers: []
})
export class BrokerageModule {}
