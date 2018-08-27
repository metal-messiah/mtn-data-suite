import { MapPointLayer } from './map-point-layer';
import { Mappable } from '../interfaces/mappable';
import { GooglePlace } from './google-place';
import { PgMappable } from './pg-mappable';

import { Color } from '../core/functionalEnums/Color';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';

export class PlannedGroceryLayer extends MapPointLayer<PgMappable> {

  pgMappables: PgMappable[];

  constructor(map: google.maps.Map) {
    super(map);
    this.pgMappables = [];

    // this.markerDragEnd$.subscribe((draggedMarker: PgMappable) => {
    //   console.log('LAYER', draggedMarker.getCoordinates());
    // });
    
  }

  setPgFeature(pgMappable: PgMappable, draggable) {
    this.clearMarkers();
    this.pgMappables = [];

    pgMappable.setDraggable(draggable);

    this.createMarkerFromMappable(pgMappable);
    this.addToMap(this.map);
  }

}
