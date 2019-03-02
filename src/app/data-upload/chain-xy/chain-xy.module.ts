import { NgModule } from '@angular/core';
import { ChainXyMapComponent } from './chain-xy-map/chain-xy-map.component';
import { ChainXyTableComponent } from './chain-xy-table/chain-xy-table.component';
import { ChainXyDataFormComponent } from './chain-xy-map/chain-xy-data-form/chain-xy-data-form.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule],
  declarations: [
    ChainXyMapComponent,
    ChainXyTableComponent,
    ChainXyDataFormComponent
  ],
  providers: []
})
export class ChainXyModule {
}
