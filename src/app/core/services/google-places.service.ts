import { Injectable } from '@angular/core';
import { MapService } from './map.service';
import { Observable } from 'rxjs/Observable';
import { GooglePlace } from '../../models/GooglePlace';

@Injectable()
export class GooglePlacesService {

  placesService: google.maps.places.PlacesService;

  constructor(private mapService: MapService) {
    this.placesService = new google.maps.places.PlacesService(this.mapService.getMap());
  }

  searchFor(queryString: string): Observable<GooglePlace[]> {
    return Observable.create(observer => {
      const request = {
        bounds: this.mapService.getBounds(),
        name: queryString,
        rankBy: google.maps.places.RankBy.PROMINENCE
      };
      this.placesService.nearbySearch(request, (response) => {
          console.log(response);
          observer.next(response.map(place => new GooglePlace(place)));
        }
      );
    });
  }

}
