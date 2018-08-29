import { MapPointLayer } from './map-point-layer';
import { PgMappable } from './pg-mappable';

export class PlannedGroceryLayer extends MapPointLayer<PgMappable> {

  pgMappable: PgMappable;

  constructor(map: google.maps.Map) {
    super(map);
  }

  setPgFeature(pgFeature: { attributes: { OBJECTID }, geometry: { y: number, x: number } }, draggable) {
    this.clearMarkers();
    this.pgMappable = new PgMappable(pgFeature);
    this.pgMappable.setDraggable(draggable);
    this.createMarkerFromMappable(this.pgMappable);
    this.addToMap(this.map);
  }

}
