import { MapPointLayer } from './map-point-layer';
import { LatLng } from './latLng';
import { Mappable } from '../interfaces/mappable';
import { Color } from '../core/functionalEnums/Color';
import { MapService } from '../core/services/map.service';

export class FindMeLayer extends MapPointLayer<Mappable> {

  findMeMappable: Mappable;

  constructor(mapService: MapService, coordinates: LatLng) {
    super(mapService);
    this.findMeMappable = {
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
    this.addToMap(this.mapService.getMap());
  }
}
