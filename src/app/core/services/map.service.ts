import { Injectable } from '@angular/core';
import {} from '@types/googlemaps';
import { Popup } from '../../models/popup';
import { Mappable } from '../../interfaces/mappable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MapService {

  map: google.maps.Map;
  latitude = 0;
  longitude = 0;
  markers: (Popup|google.maps.Marker)[];
  mode = 'POPUP';
  mappables: Mappable[];
  boundsChanged$ = new Subject<any>();
  markerClick$ = new Subject<number>();
  mapClick$ = new Subject<object>();

  constructor() {
  }

  initialize(element: HTMLElement) {
    this.map = new google.maps.Map(element, {
      center: {lat: this.latitude, lng: this.longitude},
      zoom: 8
    });
    this.markers = [];
    this.map.addListener('bounds_changed', () => this.boundsChanged$.next(this.map.getBounds().toJSON()));
    this.map.addListener('click', (event) => this.mapClick$.next(event.latLng.toJSON()));
  }

  getBoundsChanged(): Subject<any> {
    return this.boundsChanged$;
  }

  getMarkerClick(): Subject<number> {
    return this.markerClick$;
  }

  getMapClick(): Subject<object> {
    return this.mapClick$;
  }

  setCenter(latitude: number, longitude: number) {
    this.map.setCenter({lat: latitude, lng: longitude});
  }

  setZoom(zoom: number) {
    this.map.setZoom(zoom);
  }

  drawMappables(mappables: Mappable[]) {
    this.mappables = mappables;
    this.deleteMarkers();
    if (this.map.getZoom() < 10) {
      this.mode = 'MARKER';
    }
    mappables.forEach(mappable => {
      const coords = mappable.getCoordinates();
      const latLng = new google.maps.LatLng(coords[1], coords[0]);
      const label = mappable.getLabel();

      let marker: Popup | google.maps.Marker;
      if (this.mode === 'POPUP') {
        marker = new Popup({position: latLng, map: this.map, label: label});
      } else {
        marker = new google.maps.Marker({position: latLng, map: this.map, label: label[0]});
      }
      marker.set('mappable', mappable);
      marker.addListener('click', () => this.markerClick$.next(marker.get('mappable')['id']));
      this.markers.push(marker);
    });
  }

  deleteMarkers() {
    this.clearMarkers();
    this.markers = [];
  }

  clearMarkers() {
    this.setMapOnAll(this.markers, null);
  }

  setMapOnAll(collection: any[], map) {
    collection.forEach(marker => marker.setMap(map));
  }

  toggleMode() {
    this.mode = this.mode === 'POPUP' ? 'MARKER' : 'POPUP';
    this.drawMappables(this.mappables);
  }
}
