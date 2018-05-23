import { MapPointLayer } from './map-point-layer';
import { Coordinates } from './coordinates';
import { Mappable } from '../interfaces/mappable';
import { Color } from '../core/functionalEnums/Color';

export class FollowMeLayer extends MapPointLayer<Mappable> {

  locationMarker: google.maps.Marker;

  constructor() {
    super({
      getMappableIsDraggable: (mappable: Mappable) => {
        return false;
      },
      getMappableIcon: (mappable: Mappable) => {
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
      getMappableLabel: (mappable: Mappable) => {
        return null;
      }
    });

    // Create Marker
    this.locationMarker = new google.maps.Marker({
      position: {lat: 0, lng: 0}
    });
    this.markers = [ this.locationMarker ];
    this.setMarkerOptions(this.locationMarker);
  }

  updatePosition(coordinates: Coordinates) {
    this.locationMarker.setPosition(coordinates);
  }
}
