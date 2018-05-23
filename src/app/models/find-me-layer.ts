import { MapPointLayer } from './map-point-layer';
import { Coordinates } from './coordinates';
import { Mappable } from '../interfaces/mappable';
import { Color } from '../core/functionalEnums/Color';

export class FindMeLayer extends MapPointLayer<Mappable> {

  locationMarker: google.maps.Marker;

  constructor(coordinates: Coordinates) {
    super({
      getMappableIsDraggable: (mappable: Mappable) => {
        return false;
      },
      getMappableIcon: (mappable: Mappable) => {
        return {
          path: google.maps.SymbolPath.CIRCLE,
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
      position: coordinates
    });
    this.markers = [ this.locationMarker ];
    this.setMarkerOptions(this.locationMarker);
    this.locationMarker.setAnimation(google.maps.Animation.BOUNCE);
  }
}
