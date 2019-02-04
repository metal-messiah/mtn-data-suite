import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChainXyMapComponent } from './chain-xy-map/chain-xy-map.component';
import { ChainXyService } from './chain-xy-service.service';
import { ChainXyTableComponent } from './chain-xy-table/chain-xy-table.component';

@NgModule({
	imports: [ CommonModule ],
	declarations: [ ChainXyMapComponent, ChainXyTableComponent ],
	providers: []
})
export class ChainXyModule {}
