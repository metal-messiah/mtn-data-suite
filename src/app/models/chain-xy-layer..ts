import { MapPointLayer } from './map-point-layer';
import { StoreSourceMappable } from './store-source-mappable';
import { MapService } from '../core/services/map.service';
import { ChainXy } from './chain-xy';

export class ChainXyLayer extends MapPointLayer<StoreSourceMappable> {
    chainXyMappable: StoreSourceMappable;

    constructor(mapService: MapService) {
        super(mapService);
    }

    setChainXyFeature(chainXyFeature: ChainXy, draggable) {
        this.clearMarkers();
        this.chainXyMappable = new StoreSourceMappable({lat: chainXyFeature.Latitude, lng: chainXyFeature.Longitude});
        this.chainXyMappable.setDraggable(draggable);
        this.createMarkerFromMappable(this.chainXyMappable);
        this.addToMap(this.mapService.getMap());
    }
}
