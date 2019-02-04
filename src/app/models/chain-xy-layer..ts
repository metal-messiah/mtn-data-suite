import { MapPointLayer } from './map-point-layer';
import { ChainXyMappable } from './chain-xy-mappable';
import { MapService } from '../core/services/map.service';

export class ChainXyLayer extends MapPointLayer<ChainXyMappable> {
	chainXyMappable: ChainXyMappable;

	constructor(mapService: MapService) {
		super(mapService);
	}

	setChainXyFeature(chainXyFeature: { attributes: { OBJECTID }; geometry: { y: number; x: number } }, draggable) {
		this.clearMarkers();
		this.chainXyMappable = new ChainXyMappable(chainXyFeature);
		this.chainXyMappable.setDraggable(draggable);
		this.createMarkerFromMappable(this.chainXyMappable);
		this.addToMap(this.mapService.getMap());
	}
}
