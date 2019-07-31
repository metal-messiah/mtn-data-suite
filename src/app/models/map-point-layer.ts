import { Mappable } from '../interfaces/mappable';
import { Subject } from 'rxjs';
import { MapService } from '../core/services/map.service';

import * as MarkerWithLabel from '@google/markerwithlabel';

/*
  The Map Point Layer should represent a list of Mappables on a map.
  - Mappables is not added to or reduced, but rather replaced (managed externally)
  - Emits marker click events
  - Can be added to and removed from map
 */
export class MapPointLayer<T extends Mappable> {

  markerClick$ = new Subject<T>();
  markerDrag$ = new Subject<T>();
  markerDragEnd$ = new Subject();

  protected markers: google.maps.Marker[];
  protected mapService: MapService;

  constructor(mapService: MapService) {
    this.mapService = mapService;
    this.markers = [];
  }

  addToMap(map: google.maps.Map) {
    this.markers.forEach((marker) => {
      marker.setMap(map);
    });
  }

  removeFromMap() {
    this.markers.forEach((marker) => marker.setMap(null));
  }

  clearMarkers(): void {
    this.removeFromMap();
    this.markers = [];
  }

  getCoordinatesOfMappableMarker(mappable: T): google.maps.LatLngLiteral {
    const marker = this.getMarkerForMappable(mappable);
    return marker.getPosition().toJSON();
  }

  protected createMarkersFromMappables(mappables: T[]) {
    mappables.forEach((mappable) => this.createMarkerFromMappable(mappable));
  }

  protected createMarkerFromMappable(mappable: T) {
    const marker = mappable.hasOwnProperty('options') ?
      new MarkerWithLabel({position: mappable.getCoordinates()}) :
      new google.maps.Marker({
        position: mappable.getCoordinates()
      });
    marker.addListener('click', () => this.markerClick$.next(mappable));
    marker.addListener('drag', () => this.markerDrag$.next(mappable));
    marker.addListener('dragend', () => this.markerDragEnd$.next(mappable));

    // Preserve relationship between marker and mappable
    marker.set('mappable', mappable);
    this.markers.push(marker);
    this.setMarkerOptions(marker);
  }

  getMarkersCount(): number {
    return this.markers.length;
  }

  protected getMarkerForMappable(mappable: T) {
    return this.markers.find((marker) => marker.get('mappable') === mappable);
  }

  protected setMarkerOptions(marker: google.maps.Marker): void {
    const mappable: Mappable = marker.get('mappable');
    marker.setDraggable(mappable.isDraggable());
    if (mappable.hasOwnProperty('options')) {
      marker.setOptions(mappable['getOptions']());
    } else {
      marker.setIcon(mappable.getIcon());
      marker.setLabel(mappable.getLabel());
    }
  }
}
