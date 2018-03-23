import { Injectable } from '@angular/core';
import {} from '@types/googlemaps';
import { Mappable } from '../../interfaces/mappable';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { MarkerType } from '../enums/MarkerType';
import { MarkerPath } from '../enums/MarkerPath';
import { Color } from '../enums/Color';
import { IconService } from './icon.service';

export enum Mode {
  DEFAULT, MULTI_SELECT
}

export enum ClickListener {
  DEFAULT_CLICK_LISTENER = 'd',
  MULTI_SELECT_CLICK_LISTENER = 'm'
}

@Injectable()
export class MapService {

  mode: Mode = Mode.DEFAULT;
  map: google.maps.Map;
  geocoder: google.maps.Geocoder;
  latitude = 0;
  longitude = 0;
  markers: google.maps.Marker[];
  markerType = MarkerType.PIN;
  mappables: Mappable[];
  boundsChanged$ = new Subject<any>();
  markerClick$ = new Subject<number>();
  mapClick$ = new Subject<object>();
  newMarker: google.maps.Marker;
  drawingManager: google.maps.drawing.DrawingManager;
  selectedMappables: Mappable[];
  followMeMarker: google.maps.Marker;
  userLocation: google.maps.LatLng;

  constructor(private iconService: IconService) {
  }

  initialize(element: HTMLElement) {
    // Create map
    this.map = new google.maps.Map(element, {
      center: {lat: this.latitude, lng: this.longitude},
      zoom: 8
    });

    // Init Markers
    this.markers = [];
    this.mappables = [];
    this.selectedMappables = [];

    // Listen to events and pass them on via subjects
    this.map.addListener('bounds_changed', () => {
      if (this.map != null) {
        this.boundsChanged$.next(this.map.getBounds().toJSON());
      } else {
        console.warn('Map not yet initialized!');
      }
    });
    this.map.addListener('click', (event) => this.mapClick$.next(event.latLng.toJSON()));

    // Setup Drawing Manager
    this.drawingManager = new google.maps.drawing.DrawingManager();
  }

  /*
  Mutators
   */
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
      this.markerType = MarkerType.PIN;
    }
    mappables.forEach(mappable => {
      const coords = mappable.getCoordinates();
      const latLng = new google.maps.LatLng(coords[1], coords[0]);
      const label = mappable.getLabel();

      const marker = new google.maps.Marker({
        position: latLng,
        map: this.map
      });
      marker.set('mappable', mappable);
      marker.set(ClickListener.DEFAULT_CLICK_LISTENER, () => this.selectMarker(marker));
      marker.set(ClickListener.MULTI_SELECT_CLICK_LISTENER, () => {
        this.selectedMappables.push(marker.get('mappable'));
        this.resetStyles();
      });
      this.setMarkerStyle(marker, label);
      if (this.mode === Mode.DEFAULT) {
        marker.addListener('click', marker.get(ClickListener.DEFAULT_CLICK_LISTENER));
      } else if (this.mode === Mode.MULTI_SELECT) {
        marker.addListener('click', marker.get(ClickListener.MULTI_SELECT_CLICK_LISTENER));
      }
      this.markers.push(marker);
    });
  }

  selectMarker(marker: google.maps.Marker) {
    const mappable = marker.get('mappable');
    this.selectedMappables = [mappable];
    this.markerClick$.next(mappable.getId());
    this.resetStyles();
  }

  markerIsSelected(marker: google.maps.Marker) {
    const mappable: Mappable = marker.get('mappable');
    return this.selectedMappables.some(m => m.getId() === mappable.getId());
  }

  setMarkerStyle(marker: google.maps.Marker, label: string) {
    const fillColor = this.markerIsSelected(marker) ? Color.BLUE : Color.RED;

    if (this.markerType === MarkerType.PIN) {
      marker.setIcon(this.iconService.getIcon(fillColor, Color.WHITE, MarkerPath.FILLED));
      marker.setLabel({
        color: Color.WHITE,
        fontWeight: 'bold',
        text: label[0]
      });
    } else if (this.markerType === MarkerType.LABEL) {
      marker.setIcon(this.iconService.getIcon(fillColor, Color.WHITE, google.maps.SymbolPath.CIRCLE));
      marker.setLabel({
        color: Color.BLACK,
        fontWeight: 'bold',
        text: label
      });
    }
  }

  resetStyles() {
    this.markers.forEach(marker => {
      this.setMarkerStyle(marker, marker.getLabel().text);
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

  setMarkerType(type: MarkerType) {
    this.markerType = type;
    this.drawMappables(this.mappables);
  }

  getMarkerType() {
    return this.markerType;
  }

  createNewMarker() {
    this.newMarker = new google.maps.Marker({
      position: this.map.getCenter(),
      icon: this.iconService.getIcon(Color.PURPLE, Color.WHITE, MarkerPath.DEFAULT),
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP
    });
  }

  deleteNewMarker(): void {
    this.newMarker.setMap(null);
    this.newMarker = null;
  }

  getNewMarkerAddress() {
    return Observable.create((observer) => {
      this.geocoder.geocode({'location': this.newMarker.getPosition()}, (results, status) => {
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

  parseAddressResults(results: object[]) {
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

  buildAddress(streetNumber: string, streetRoute: string) {
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

  getAddressItem(result: object[], itemName: string) {
    const item = result.find((i) => i['types'].includes(itemName));
    if (item != null) {
      return item['short_name'];
    }
    return null;
  }

  activateMultiSelect() {
    this.mode = Mode.MULTI_SELECT;

    // Create drawing manager
    const multiSelectDrawingOptions = {
      drawingControlOptions: {
        drawingModes: [
          google.maps.drawing.OverlayType.RECTANGLE,
          google.maps.drawing.OverlayType.CIRCLE,
          google.maps.drawing.OverlayType.POLYGON],
        position: google.maps.ControlPosition.LEFT_BOTTOM
      }
    };
    this.drawingManager.setOptions(multiSelectDrawingOptions);
    this.drawingManager.setMap(this.map);

    // Reset selection and listeners
    this.selectedMappables = [];
    this.markers.forEach(marker => {
      google.maps.event.clearListeners(marker, 'click');
      marker.addListener('click', marker.get(ClickListener.MULTI_SELECT_CLICK_LISTENER));
    });
    this.resetStyles();

    // Listen for completion of drawings
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => {
      if (event.type === google.maps.drawing.OverlayType.CIRCLE) {
        this.markers.forEach(marker => {
          const cir: google.maps.Circle = event.overlay;
          if (cir.getBounds().contains(marker.getPosition()) &&
            google.maps.geometry.spherical.computeDistanceBetween(cir.getCenter(), marker.getPosition()) <= cir.getRadius()) {
            this.selectedMappables.push(marker.get('mappable'));
          }
        });
      } else if (event.type === google.maps.drawing.OverlayType.POLYGON) {
        this.markers.forEach(marker => {
          if (google.maps.geometry.poly.containsLocation(marker.getPosition(), event.overlay)) {
            this.selectedMappables.push(marker.get('mappable'));
          }
        });
      } else if (event.type === google.maps.drawing.OverlayType.RECTANGLE) {
        this.markers.forEach(marker => {
          if (event.overlay.getBounds().contains(marker.getPosition())) {
            this.selectedMappables.push(marker.get('mappable'));
          }
        });
      } else {
        console.error('Drawing Geometry type not detected!');
      }
      event.overlay.setMap(null);
      this.resetStyles();
    });
  }

  deactivateMultiSelect() {
    this.mode = Mode.DEFAULT;
    this.drawingManager.setMap(null);
    this.selectedMappables = [];
    this.markers.forEach(marker => {
      google.maps.event.clearListeners(marker, 'click');
      marker.addListener('click', marker.get(ClickListener.DEFAULT_CLICK_LISTENER));
    });
    this.resetStyles();
  }

  findMe(latitude: number, longitude: number): void {
    const userLocation = new google.maps.LatLng(latitude, longitude);
    this.map.setCenter(userLocation);
    this.map.setZoom(15);
    const userMarker = new google.maps.Marker({
      position: userLocation,
      map: this.map,
      icon: this.iconService.getIcon(Color.BLUE, Color.YELLOW, google.maps.SymbolPath.CIRCLE),
      animation: google.maps.Animation.BOUNCE
    });
    setTimeout(() => {
      userMarker.setMap(null);
    }, 5000);
  }

  followMe(latitude: number, longitude: number): void {
    this.map.setCenter(this.userLocation);
    if (this.followMeMarker == null) {
      this.followMeMarker = new google.maps.Marker({
        position: this.userLocation,
        map: this.map,
        icon: this.iconService.getIcon(Color.BLUE, Color.YELLOW, google.maps.SymbolPath.FORWARD_CLOSED_ARROW),
      });
    }
    this.followMeMarker.setPosition(this.userLocation);
  }

  stopFollowingMe() {
    this.followMeMarker.setMap(null);
    this.followMeMarker = null;
  }

  getPerspective() {
    if (this.map != null) {
      const center = this.map.getCenter();
      return {
        zoom: this.map.getZoom(),
        latitude: center.lat(),
        longitude: center.lng()
      };
    }
    return {
      zoom: 10,
      latitude: 39.8283,
      longitude: -98.5795
    };
  }
}
