import { Mappable } from '../interfaces/mappable';
import { LatLng } from './latLng';
import PlaceResult = google.maps.places.PlaceResult;
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { Color } from '../core/functionalEnums/Color';
import MarkerLabel = google.maps.MarkerLabel;
import * as MarkerWithLabel from '@google/markerwithlabel';

export class GooglePlace implements PlaceResult, Mappable {

  place_id: string;
  id: string;
  geometry: google.maps.places.PlaceGeometry;
  icon: string;
  name: string;
  types: string[];
  url: string;
  vicinity: string;
  address_components: google.maps.GeocoderAddressComponent[];
  adr_address: string;
  formatted_address: string;
  formatted_phone_number: string;
  html_attributions: string[];
  international_phone_number: string;
  opening_hours: google.maps.places.OpeningHours;
  permanently_closed: boolean;
  photos: google.maps.places.PlacePhoto[];
  price_level: number;
  rating: number;
  reviews: google.maps.places.PlaceReview[];
  utc_offset: number;
  website: string;
  aspects: google.maps.places.PlaceAspectRating[];

  options = {
    icon: '/assets/images/google-g-map-icon.png',
    labelAnchor: new google.maps.Point(0, 0),
    labelClass: 'google-places-marker-label',
    labelInBackground: false
  };

  constructor(obj) {
    Object.assign(this, obj);
    this.id = this.place_id;
  }

  getCoordinates(): LatLng {
    return this.geometry.location.toJSON();
  }

  getOptions() {
    const label = { labelContent: this.name };
    return Object.assign({}, this.options, label);
  }

  getIcon(markerType?: MarkerType): (string | google.maps.Icon | google.maps.Symbol) {
    // Use default google marker
    return null;
  }

  getLabel(markerType?: MarkerType): string | MarkerLabel {
    if (markerType !== MarkerType.LOGO) {
      return {
        text: this.name,
        color: Color.BLACK
      };
    }
    return this.name;
  }

  isDraggable(): boolean {
    return false;
  }
}
