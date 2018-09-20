import { Mappable } from '../interfaces/mappable';
import { Coordinates } from './coordinates';
import PlaceResult = google.maps.places.PlaceResult;
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { Color } from '../core/functionalEnums/Color';
import MarkerLabel = google.maps.MarkerLabel;

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

  constructor(obj) {
    Object.assign(this, obj);
    this.id = this.place_id;
  }

  getCoordinates(): Coordinates {
    return this.geometry.location.toJSON();
  };

  getIcon(markerType?: MarkerType): (string | google.maps.Icon | google.maps.Symbol) {
    return {
      path: MarkerShape.FILLED,
      fillColor: Color.PINK,
      fillOpacity: 1,
      scale: 0.075,
      strokeColor: Color.WHITE,
      strokeWeight: 2.5,
      anchor: new google.maps.Point(80, 510),
      labelOrigin: new google.maps.Point(255, -80),
      rotation: 0
    };
  };

  getLabel(markerType?: MarkerType): string | MarkerLabel {
    if (markerType !== MarkerType.LOGO) {
      return {
        text: this.name,
        color: Color.BLACK
      };
    }
    return this.name;
  };

  isDraggable(): boolean {
    return false;
  };

}
