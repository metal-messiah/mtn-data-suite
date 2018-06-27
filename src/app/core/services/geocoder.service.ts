import { Injectable } from '@angular/core';
import LatLngLiteral = google.maps.LatLngLiteral;
import { Observable } from 'rxjs/index';

@Injectable()
export class GeocoderService {

  geocoder: google.maps.Geocoder;

  constructor() {
    this.geocoder = new google.maps.Geocoder();
  }

  reverseGeocode(coordinates: LatLngLiteral) {
    return Observable.create((observer) => {
      this.geocoder.geocode({'location': coordinates}, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results.length > 0) {
            observer.next(this.parseAddressResults(results[0].address_components));
          } else {
            observer.next(null);
          }
        } else {
          observer.error(status);
        }
      });
    });
  }

  private parseAddressResults(results: object[]) {
    const streetNumber = this.getAddressItem(results, 'street_number');
    const streetRoute = this.getAddressItem(results, 'route');
    return {
      address1: this.buildAddress(streetNumber, streetRoute),
      city: this.getAddressItem(results, 'locality'),
      county: this.getAddressItem(results, 'administrative_area_level_2'),
      state: this.getAddressItem(results, 'administrative_area_level_1'),
      postalCode: this.getAddressItem(results, 'postal_code')
    };
  }

  private buildAddress(streetNumber: string, streetRoute: string) {
    let address = '';
    if (streetNumber != null) {
      address += streetNumber;
      if (streetRoute != null) {
        address += ' ';
      }
    }
    if (streetRoute != null) {
      address += streetRoute;
    }
    return address;
  }

  private getAddressItem(result: object[], itemName: string) {
    const item = result.find((i) => i['types'].includes(itemName));
    if (item != null) {
      return item['short_name'];
    }
    return null;
  }

}
