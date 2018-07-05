import { MapPointLayer } from './map-point-layer';
import { Coordinates } from './coordinates';
import { Mappable } from '../interfaces/mappable';
import { Color } from '../core/functionalEnums/Color';

export class FollowMeLayer extends MapPointLayer<Mappable> {

  followMeMappable: Mappable;

  constructor(map: google.maps.Map, coordinates: Coordinates) {
    super(map);

    this.followMeMappable = {
      id: 1,
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
  }

  updatePosition(coordinates: Coordinates) {
    this.getMarkerForMappable(this.followMeMappable).setPosition(coordinates);
  }
}
