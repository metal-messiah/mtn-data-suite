import { MapPointLayer } from './map-point-layer';
import { Coordinates } from './coordinates';
import { Mappable } from '../interfaces/mappable';
import { Color } from '../core/functionalEnums/Color';

export class FindMeLayer extends MapPointLayer<Mappable> {

  findMeMappable: Mappable;

  constructor(map: google.maps.Map, coordinates: Coordinates) {
    super(map);
    this.findMeMappable = {
      id: 1,
      getCoordinates: () => coordinates,
      getLabel: () => '',
      getIcon: () => {
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
      isDraggable: () => false
    };
    this.createMarkerFromMappable(this.findMeMappable);

    this.getMarkerForMappable(this.findMeMappable).setAnimation(google.maps.Animation.BOUNCE);
  }
}
