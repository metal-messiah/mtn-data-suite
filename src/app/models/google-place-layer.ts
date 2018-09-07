import { MapPointLayer } from './map-point-layer';
import { Mappable } from '../interfaces/mappable';
import { GooglePlace } from './google-place';
import { MapService } from '../core/services/map.service';

export class GooglePlaceLayer extends MapPointLayer<Mappable> {

  googlePlaceMappables: GooglePlace[];

  constructor(mapService: MapService) {
    super(mapService);
    this.googlePlaceMappables = [];
  }

  setGooglePlaces(googlePlaces: GooglePlace[]) {
    this.clearMarkers();
    this.googlePlaceMappables = [];
    this.createMarkersFromMappables(googlePlaces);
    this.addToMap(this.mapService.getMap());
  }

}
