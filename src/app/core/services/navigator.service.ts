import { Injectable } from '@angular/core';
import { LatLng } from '../../models/latLng';
import { Observable } from 'rxjs';

@Injectable()
export class NavigatorService {

  watchIds: number[];

  constructor() {
    this.watchIds = [];
  }

  getCurrentPosition(): Observable<LatLng> {
    return Observable.create(observer => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          observer.next({lat: position.coords.latitude, lng: position.coords.longitude});
        }, (err) => {
          observer.error(`Can't show location: ${err}`);
        });
      } else {
        observer.error(`Browser doesn't support Geolocation!`);
      }
    });
  }

  watchPosition(geolocationOptions) {
    return Observable.create(observer => {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          observer.next({lat: position.coords.latitude, lng: position.coords.longitude});
        },
        (err) => {
          observer.error(err);
        },
        geolocationOptions);
      this.watchIds.push(watchId);
    });
  }

  cancelWatch() {
    this.watchIds.forEach(id => {
      navigator.geolocation.clearWatch(id);
    });
  }
}
