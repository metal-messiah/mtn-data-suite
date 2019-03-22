import { MapPointLayer } from './map-point-layer';
import { Coordinates } from './coordinates';
import { Mappable } from '../interfaces/mappable';
import { Color } from '../core/functionalEnums/Color';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { MapService } from '../core/services/map.service';

export class DraggableSiteLayer extends MapPointLayer<Mappable> {

  newSiteMappable: Mappable;

  constructor(mapService: MapService, coordinates: Coordinates) {
    super(mapService);
    this.newSiteMappable = {
      getCoordinates: () => coordinates,
      getLabel: () => '',
      getIcon: () => {
        return {
          path: MarkerShape.DEFAULT,
          fillColor: Color.PURPLE,
          fillOpacity: 1,
          scale: 0.075,
          strokeColor: Color.WHITE,
          strokeWeight: 2.5,
          anchor: new google.maps.Point(255, 510),
          labelOrigin: new google.maps.Point(255, 230),
          rotation: 0
        };
      },
      isDraggable: () => true
    };
    this.createMarkerFromMappable(this.newSiteMappable);
    this.addToMap(this.mapService.getMap());
  }

  getCoordinatesOfDraggableMarker() {
    return this.getCoordinatesOfMappableMarker(this.newSiteMappable);
  }
}
