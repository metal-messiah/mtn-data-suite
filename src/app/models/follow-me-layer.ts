import { MapPointLayer } from './map-point-layer';
import { Coordinates } from './coordinates';
import { Mappable } from '../interfaces/mappable';
import { Color } from '../core/functionalEnums/Color';
import { MapService } from '../core/services/map.service';

export class FollowMeLayer extends MapPointLayer<Mappable> {

  followMeMappable: Mappable;

  constructor(mapService: MapService, coordinates: Coordinates) {
    super(mapService);

    this.followMeMappable = {
      getCoordinates: () => coordinates,
      getLabel: () => '',
      getIcon: () => {
        return {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: Color.BLUE,
          fillOpacity: 0.7,
          scale: 7,
          strokeColor: Color.YELLOW,
          strokeWeight: 2.5,
          labelOrigin: new google.maps.Point(0, -2)
        };
      },
      isDraggable: () => false
    };
    this.createMarkerFromMappable(this.followMeMappable);
    this.addToMap(this.mapService.getMap());
  }

  updatePosition(coordinates: Coordinates) {
    this.getMarkerForMappable(this.followMeMappable).setPosition(coordinates);
  }
}
