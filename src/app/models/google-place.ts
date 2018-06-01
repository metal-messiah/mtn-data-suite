import { Mappable } from '../interfaces/mappable';
import { Coordinates } from './coordinates';
import PlaceResult = google.maps.places.PlaceResult;
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { Color } from '../core/functionalEnums/Color';

export class GooglePlace implements PlaceResult, Mappable {

  address_components: google.maps.GeocoderAddressComponent[];
  adr_address: string;
  formatted_address: string;
  formatted_phone_number: string;
  geometry: google.maps.places.PlaceGeometry;
  html_attributions: string[];
  icon: string;
  id: string;
  international_phone_number: string;
  name: string;
  opening_hours: google.maps.places.OpeningHours;
  permanently_closed: boolean;
  photos: google.maps.places.PlacePhoto[];
  place_id: string;
  price_level: number;
  rating: number;
  reviews: google.maps.places.PlaceReview[];
  types: string[];
  url: string;
  utc_offset: number;
  vicinity: string;
  website: string;

  constructor(obj) {
    Object.assign(this, obj);
    this.id = this.place_id;
  }

  getCoordinates(): Coordinates {
    return this.geometry.location.toJSON();
  };

  getIcon(markerType?: MarkerType): (string | google.maps.Icon | google.maps.Symbol) {
    if (this.icon != null) {
      return this.icon;
    }
    return {
      path: MarkerShape.FILLED,
      fillColor: Color.PINK,
      fillOpacity: 1,
      scale: 0.075,
      strokeColor: Color.WHITE,
      strokeWeight: 2.5,
      anchor: new google.maps.Point(80, 510),
      labelOrigin: new google.maps.Point(255, 230),
      rotation: 0
    };
  };

  getLabel(markerType?: MarkerType): string {
    if (markerType !== MarkerType.LOGO) {
      return name[0];
    }
    return name;
  };

  isDraggable(): boolean {
    return false;
  };

}
