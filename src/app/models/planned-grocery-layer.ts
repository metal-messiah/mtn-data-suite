import { MapPointLayer } from './map-point-layer';
import { PgMappable } from './pg-mappable';
import { MapService } from '../core/services/map.service';

export class PlannedGroceryLayer extends MapPointLayer<PgMappable> {

  pgMappable: PgMappable;

  constructor(mapService: MapService) {
    super(mapService);
  }

  setPgFeature(pgFeature: { attributes: { OBJECTID }, geometry: { y: number, x: number } }, draggable) {
    this.clearMarkers();
    this.pgMappable = new PgMappable(pgFeature);
    this.pgMappable.setDraggable(draggable);
    this.createMarkerFromMappable(this.pgMappable);
    this.addToMap(this.mapService.getMap());
  }

}
