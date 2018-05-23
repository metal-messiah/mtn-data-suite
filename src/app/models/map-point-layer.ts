import { Mappable } from '../interfaces/mappable';
import { MapPointLayerOptions } from '../interfaces/map-point-layer-options';
import { Subject } from 'rxjs/Subject';

/*
  The Map Point Layer should represent a list of Mappables on a map.
  - Mappables is not added to or reduced, but rather replaced (managed externally)
  - Takes a MapPointLayerOptions object to determine the marker style
  - Emits marker click events
  - Can be added to and removed from map
 */
export class MapPointLayer<T extends Mappable> {

  layerOptions: MapPointLayerOptions;
  markers: google.maps.Marker[];

  markerClick$ = new Subject<T>();

  constructor(layerOptions: MapPointLayerOptions) {
    this.layerOptions = layerOptions;
    this.markers = [];
  }

  createMarkersFromMappables(mappables: T[]) {
    mappables.forEach(mappable => this.createMarkerFromMappable(mappable));
  }

  createMarkerFromMappable(mappable: T) {
    const marker = new google.maps.Marker({
      position: mappable.getCoordinates()
    });
    marker.addListener('click', () => this.markerClick$.next(mappable));
    // Preserve relationship between marker and mappable
    marker.set('mappable', mappable);
    this.markers.push(marker);
    this.setMarkerOptions(marker);
  }

  refreshOptionsForMappable(mappable: T): void {
    const marker = this.getMarkerForMappable(mappable);
    this.setMarkerOptions(marker);
  }

  refreshOptionsForMappables(mappables: T[]): void {
    mappables.forEach(mappable => this.refreshOptionsForMappable(mappable));
  }

  getMarkerForMappable(mappable: T) {
    return this.markers.find(marker => marker.get('mappable').id === mappable.id);
  }

  refreshOptions(): void {
    this.markers.forEach(marker => this.setMarkerOptions(marker));
  }

  setMarkerOptions(marker: google.maps.Marker): void {
    const mappable = marker.get('mappable');
    marker.setDraggable(this.layerOptions.getMappableIsDraggable(mappable));
    marker.setIcon(this.layerOptions.getMappableIcon(mappable));
    marker.setLabel(this.layerOptions.getMappableLabel(mappable));
  }

  addToMap(map: google.maps.Map) {
    this.markers.forEach(marker => {
      marker.setMap(map);
    });
  }

  removeFromMap() {
    this.markers.forEach(marker => marker.setMap(null));
  }

  clearMarkers(): void {
    this.removeFromMap();
    this.markers = [];
  }

  getCoordinatesOfMappableMarker(mappable: T): google.maps.LatLngLiteral {
    const marker = this.markers.find(m => {
      return m.get('mappable').id === mappable.id;
    });
    return marker.getPosition().toJSON();
  }

  getMappablesInShape(shape): T[] {
    const mappablesInShape: T[] = [];
    if (shape.type === google.maps.drawing.OverlayType.CIRCLE) {
      this.markers.forEach(marker => {
        const cir: google.maps.Circle = shape.overlay;
        if (cir.getBounds().contains(marker.getPosition()) &&
          google.maps.geometry.spherical.computeDistanceBetween(cir.getCenter(), marker.getPosition()) <= cir.getRadius()) {
          mappablesInShape.push(marker.get('mappable'));
        }
      });
    } else if (shape.type === google.maps.drawing.OverlayType.POLYGON) {
      this.markers.forEach(marker => {
        if (google.maps.geometry.poly.containsLocation(marker.getPosition(), shape.overlay)) {
          mappablesInShape.push(marker.get('mappable'));
        }
      });
    } else if (shape.type === google.maps.drawing.OverlayType.RECTANGLE) {
      this.markers.forEach(marker => {
        if (shape.overlay.getBounds().contains(marker.getPosition())) {
          mappablesInShape.push(marker.get('mappable'));
        }
      });
    } else {
      console.error('Drawing Geometry type not detected!');
    }
    return mappablesInShape;
  }

  resetPositionOfMappable(site: T) {
    const marker = this.getMarkerForMappable(site);
    marker.setPosition(site.getCoordinates());
  }
}
