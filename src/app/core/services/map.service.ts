import { Injectable } from '@angular/core';
import {} from '@types/googlemaps';
import { Subject } from 'rxjs/Subject';
import { MapPointLayer } from '../../models/map-point-layer';
import { Observable } from 'rxjs/Observable';
import { GooglePlace } from '../../models/google-place';
import { Coordinates } from '../../models/coordinates';
import { Mappable } from '../../interfaces/mappable';

/*
  The MapService should
  - Initialize a map
  - Draw overlays as specified by components
  - Expose controls to pan and zoom
  - Expose methods to get the center, bounds and zoom level
 */
@Injectable()
export class MapService {

  map: google.maps.Map;
  boundsChanged$: Subject<any>;
  mapClick$: Subject<Coordinates>;

  drawingManager: google.maps.drawing.DrawingManager;
  drawingEvents: any[];
  drawingComplete$: Subject<any>;

  placesService: google.maps.places.PlacesService;

  constructor() {
  }

  initialize(element: HTMLElement) {
    // Create map
    this.map = new google.maps.Map(element, {
      center: {lat: 39.8283, lng: -98.5795},
      zoom: 8
    });
    this.placesService = new google.maps.places.PlacesService(this.map);
    this.boundsChanged$ = new Subject<any>();
    this.mapClick$ = new Subject<Coordinates>();

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

  destroy(): void {
    console.log('Destroying Map');
    google.maps.event.clearListeners(this.map, 'bounds_changed');
    google.maps.event.clearListeners(this.map, 'click');
    this.map = null;
    this.placesService = null;
    this.drawingManager = null;
    this.boundsChanged$ = null;
  }

  setCenter(position: google.maps.LatLngLiteral) {
    this.map.setCenter(position);
  }

  getCenter(): google.maps.LatLngLiteral {
    return this.map.getCenter().toJSON();
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

  getBounds() {
    return this.map.getBounds().toJSON();
  }

  setZoom(zoom: number) {
    this.map.setZoom(zoom);
  }

  activateDrawingTools() {
    this.drawingEvents = [];
    this.drawingComplete$ = new Subject<any>();

    // Create drawing manager
    const multiSelectDrawingOptions = {
      drawingControl: false,
      drawingControlOptions: {
        drawingModes: [
          google.maps.drawing.OverlayType.RECTANGLE,
          google.maps.drawing.OverlayType.CIRCLE,
          google.maps.drawing.OverlayType.POLYGON]
      }
    };
    this.drawingManager.setOptions(multiSelectDrawingOptions);
    this.drawingManager.setMap(this.map);

    // Listen for completion of drawings
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => {
      this.drawingEvents.push(event);
      this.drawingComplete$.next(event);
    });

    return this.drawingComplete$;
  }

  deactivateDrawingTools() {
    this.clearDrawings();
    this.drawingManager.setMap(null);
  }

  clearDrawings() {
    this.drawingEvents.forEach(event => event.overlay.setMap(null));
  }

  setDrawingModeToClick() {
    this.drawingManager.setDrawingMode(null);
  }
  setDrawingModeToCircle() {
    this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
  }
  setDrawingModeToRectangle() {
    this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
  }
  setDrawingModeToPolygon() {
    this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
  }

  addPointLayer(pointLayer: MapPointLayer<Mappable>) {
    pointLayer.addToMap(this.map);
  }

  searchFor(queryString: string): Observable<GooglePlace[]> {
    return Observable.create(observer => {
      const request = {
        bounds: this.getBounds(),
        name: queryString
      };
      this.placesService.nearbySearch(request, (response) => {
          observer.next(response.map(place => new GooglePlace(place)));
        }
      );
    });
  }

  getDetailedGooglePlace(requestPlace: GooglePlace) {
    return Observable.create(observer => {
      const request = {
        placeId: requestPlace.id
      };
      this.placesService.getDetails(request, (resultPlace, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          observer.next(new GooglePlace(resultPlace));
        } else {
          observer.error(status);
        }
      });
    });
  }
}
