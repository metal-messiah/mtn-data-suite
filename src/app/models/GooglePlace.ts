import { Mappable } from '../interfaces/mappable';
import { Coordinates } from './coordinates';
import PlaceResult = google.maps.places.PlaceResult;

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

  constructor(obj?: PlaceResult) {
    if (obj != null) {
      Object.keys(obj).forEach(key => this[key] = obj[key]);
    }
  }

  getCoordinates(): Coordinates {
    return this.geometry.location.toJSON();
  };

  getId(): string {
    return this.place_id;
  };

  getLabel(): string {
    return this.name;
  };

}
