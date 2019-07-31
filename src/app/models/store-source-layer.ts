import { MapPointLayer } from './map-point-layer';
import { StoreSourceMappable } from './store-source-mappable';
import { MapService } from '../core/services/map.service';
import { LatLng } from './latLng';

export class StoreSourceLayer extends MapPointLayer<StoreSourceMappable> {
  storeSourceMappable: StoreSourceMappable;

  constructor(mapService: MapService) {
    super(mapService);
  }

  setPin(coords: LatLng, draggable) {
    this.clearMarkers();
    this.storeSourceMappable = new StoreSourceMappable(coords);
    this.storeSourceMappable.setDraggable(draggable);
    this.createMarkerFromMappable(this.storeSourceMappable);
    this.addToMap(this.mapService.getMap());
  }

  setDraggable(draggable: boolean) {
    this.setPin(this.storeSourceMappable.getCoordinates(), draggable);
  }
}
