import { MapPointLayer } from './map-point-layer';
import { Mappable } from '../interfaces/mappable';
import { GooglePlace } from './google-place';

export class GooglePlaceLayer extends MapPointLayer<Mappable> {

  googlePlaceMappables: GooglePlace[];

  constructor() {
    super();
    this.googlePlaceMappables = [];
  }

  setGooglePlaces(googlePlaces: GooglePlace[]) {
    this.clearMarkers();
    this.googlePlaceMappables = [];
    this.createMarkersFromMappables(googlePlaces);
  }

}
