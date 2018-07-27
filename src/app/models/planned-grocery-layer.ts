import { MapPointLayer } from './map-point-layer';
import { Mappable } from '../interfaces/mappable';
import { GooglePlace } from './google-place';
import { PgMappable } from './pg-mappable';

export class PlannedGroceryLayer extends MapPointLayer<PgMappable> {

  pgMappables: PgMappable[];

  constructor(map: google.maps.Map) {
    super(map);
    this.pgMappables = [];
  }

  setPgFeature(pgMappable: PgMappable) {
    this.clearMarkers();
    this.pgMappables = [];
    this.createMarkerFromMappable(pgMappable);
    this.addToMap(this.map);
  }

}
