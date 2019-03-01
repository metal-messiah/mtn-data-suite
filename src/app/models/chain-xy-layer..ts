import { MapPointLayer } from './map-point-layer';
import { ChainXyMappable } from './chain-xy-mappable';
import { MapService } from '../core/services/map.service';
import { ChainXy } from './chain-xy';

export class ChainXyLayer extends MapPointLayer<ChainXyMappable> {
    chainXyMappable: ChainXyMappable;

    constructor(mapService: MapService) {
        super(mapService);
    }

    setChainXyFeature(chainXyFeature: ChainXy, draggable) {
        this.clearMarkers();
        this.chainXyMappable = new ChainXyMappable(chainXyFeature);
        this.chainXyMappable.setDraggable(draggable);
        this.createMarkerFromMappable(this.chainXyMappable);
        this.addToMap(this.mapService.getMap());
    }
}
