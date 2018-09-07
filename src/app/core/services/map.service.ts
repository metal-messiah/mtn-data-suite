import { Injectable } from '@angular/core';
import {} from '@types/googlemaps';
import { GooglePlace } from '../../models/google-place';
import { Coordinates } from '../../models/coordinates';
import { Observable, Observer, of, Subject } from 'rxjs';

/*
  The MapService should
  - Initialize a map
  - Draw overlays as specified by components
  - Expose controls to pan and zoom
  - Expose methods to get the center, bounds and zoom level
 */
@Injectable()
export class MapService {

  private map: google.maps.Map;
  boundsChanged$: Subject<{ east; north; south; west }>;
  mapClick$: Subject<Coordinates>;

  circleRadiusListener: google.maps.MapsEventListener;

  drawingManager: google.maps.drawing.DrawingManager;
  drawingEvents: any[];
  drawingComplete$: Subject<any>;
  drawingMode: google.maps.drawing.OverlayType;

  placesService: google.maps.places.PlacesService;

  dataPointFeatures: google.maps.Data.Feature[];

  static getDistanceLabel(distance: number) {
    if (distance < 1000) {
      return Math.round(distance * 3.28084) + ' ft';
    } else {
      const miles: number = distance * 0.000621371;
      return miles.toFixed(2) + ' mi';
    }
  }

  static getDistanceBetween(startPoint, endPoint) {
    const startLatLng = new google.maps.LatLng(startPoint.lat, startPoint.lng);
    const endLatLng = new google.maps.LatLng(endPoint.lat, endPoint.lng);
    return google.maps.geometry.spherical.computeDistanceBetween(
      startLatLng,
      endLatLng
    );
  }

  static getHeading(startPoint, endPoint) {
    const startLatLng = new google.maps.LatLng(startPoint.lat, startPoint.lng);
    const endLatLng = new google.maps.LatLng(endPoint.lat, endPoint.lng);
    return google.maps.geometry.spherical.computeHeading(
      startLatLng,
      endLatLng
    );
  }

  static point2LatLng(point: google.maps.Point, map: google.maps.Map) {
    const topRight = map
      .getProjection()
      .fromLatLngToPoint(map.getBounds().getNorthEast());
    const bottomLeft = map
      .getProjection()
      .fromLatLngToPoint(map.getBounds().getSouthWest());
    const scale = Math.pow(2, map.getZoom());
    const worldPoint = new google.maps.Point(
      point.x / scale + bottomLeft.x,
      point.y / scale + topRight.y
    );
    return map.getProjection().fromPointToLatLng(worldPoint);
  }

  constructor() {
    this.dataPointFeatures = [];
  }

  initialize(element: HTMLElement) {
    // Create map
    this.map = new google.maps.Map(element, {
      center: {lat: 39.8283, lng: -98.5795},
      zoom: 8
    });
    this.map.getStreetView().setOptions({imageDateControl: true});
    this.placesService = new google.maps.places.PlacesService(this.map);
    this.boundsChanged$ = new Subject<{ east; north; south; west }>();
    this.mapClick$ = new Subject<Coordinates>();
    this.loadPerspective();

    // Listen to events and pass them on via subjects
    this.map.addListener('bounds_changed', () => {
      if (this.map != null) {
        this.savePerspective();
        this.boundsChanged$.next(this.map.getBounds().toJSON());
      } else {
        console.warn('Map not yet initialized!');
      }
    });
    this.map.addListener('maptypeid_changed', () => this.savePerspective());
    this.map.addListener('click', event =>
      this.mapClick$.next(event.latLng.toJSON())
    );

    // Setup Drawing Manager
    this.drawingManager = new google.maps.drawing.DrawingManager();
    this.drawingComplete$ = new Subject<any>();
    return this.map;
  }

  getZoom() {
    return this.map.getZoom();
  }

  destroy(): void {
    console.log('Destroying Map');
    google.maps.event.clearListeners(this.map, 'bounds_changed');
    google.maps.event.clearListeners(this.map, 'click');
    google.maps.event.clearListeners(this.drawingManager, 'overlaycomplete');
    this.map = null;
    this.placesService = null;
    this.drawingManager = null;
    this.drawingComplete$ = null;
    this.boundsChanged$ = null;
  }

  setCenter(position: google.maps.LatLngLiteral) {
    this.map.setCenter(position);
  }

  getCenter(): google.maps.LatLngLiteral {
    return this.map.getCenter().toJSON();
  }

  private loadPerspective() {
    of(localStorage.getItem('mapPerspective')).subscribe(perspective => {
      if (perspective != null) {
        perspective = JSON.parse(perspective);
        this.map.setCenter(perspective['center']);
        this.map.setZoom(perspective['zoom']);
        this.map.setMapTypeId(perspective['mapTypeId']);
      }
    });
  }

  savePerspective() {
    of(
      localStorage.setItem(
        'mapPerspective',
        JSON.stringify(this.getPerspective())
      )
    ).subscribe();
  }

  drawingModeIs(mode: string) {
    if (mode === 'pointer') {
      return this.drawingMode == null;
    } else if (mode === 'circle') {
      return this.drawingMode === google.maps.drawing.OverlayType.CIRCLE;
    } else if (mode === 'rectangle') {
      return this.drawingMode === google.maps.drawing.OverlayType.RECTANGLE;
    } else if (mode === 'polygon') {
      return this.drawingMode === google.maps.drawing.OverlayType.POLYGON;
    }
  }

  private getPerspective() {
    if (this.map != null) {
      return {
        zoom: this.map.getZoom(),
        center: this.map.getCenter(),
        mapTypeId: this.map.getMapTypeId()
      };
    }
    return {
      zoom: 10,
      center: {lat: 39.8283, lng: -98.5795},
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
  }

  getBounds(): { east: number; north: number; south: number; west: number } {
    return this.map.getBounds().toJSON();
  }

  setZoom(zoom: number) {
    this.map.setZoom(zoom);
  }

  activateDrawingTools() {
    this.drawingEvents = [];
    this.drawingComplete$.observers.forEach(o => o.complete());

    // Create drawing manager
    const multiSelectDrawingOptions = {
      drawingControl: false,
      drawingControlOptions: {
        drawingModes: [
          google.maps.drawing.OverlayType.RECTANGLE,
          google.maps.drawing.OverlayType.CIRCLE,
          google.maps.drawing.OverlayType.POLYGON
        ]
      }
    };
    this.drawingManager.setOptions(multiSelectDrawingOptions);
    this.drawingManager.setMap(this.map);

    google.maps.event.clearListeners(this.drawingManager, 'overlaycomplete');
    // Listen for completion of drawings
    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      event => {

        this.drawingEvents.push(event);
        this.drawingComplete$.next(event);
      }
    );

    return this.drawingComplete$;
  }

  deactivateDrawingTools() {
    this.clearCircleRadiusListener();
    this.clearDrawings();
    this.drawingManager.setMap(null);
  }

  clearDrawings() {
    this.drawingEvents.forEach(event => event.overlay.setMap(null));
  }

  private clearCircleRadiusListener() {
    if (this.circleRadiusListener != null) {
      this.circleRadiusListener.remove();
      this.circleRadiusListener = null;
    }
  }

  setDrawingModeToClick() {
    this.clearCircleRadiusListener();
    this.drawingMode = null;
    this.drawingManager.setDrawingMode(null);
  }

  setDrawingModeToCircle() {
    this.drawingMode = google.maps.drawing.OverlayType.CIRCLE;
    this.drawingManager.setDrawingMode(this.drawingMode);
    const mapDiv = document.getElementById('map');
    let startPoint: google.maps.LatLng;
    let startMarker: google.maps.Marker;
    let touchMoveListener: google.maps.MapsEventListener;
    let mouseMoveListener: google.maps.MapsEventListener;

    this.circleRadiusListener = this.map.addListener('mousedown', e => {
      startPoint = e.latLng;
      startMarker = new google.maps.Marker({
        position: startPoint,
        map: this.map,
        title: 'distance',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: 'blue',
          fillOpacity: 0.5,
          scale: 3,
          strokeColor: 'white',
          strokeWeight: 1,
          labelOrigin: new google.maps.Point(-8, -12)
        },
        label: {
          text: '0m',
          color: 'white',
          fontWeight: 'bold'
        }
      });

      const eventListener$ = new Subject<google.maps.Point>();
      eventListener$.subscribe(point => {
        const latLng = MapService.point2LatLng(point, this.map);
        startMarker.setPosition(latLng);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          startPoint,
          latLng
        );
        const label = {
          text: MapService.getDistanceLabel(distance),
          color: 'black',
          fontWeight: 'bold'
        };
        startMarker.setLabel(label);
      });

      touchMoveListener = google.maps.event.addDomListener(
        mapDiv,
        'touchmove',
        touchEvent => {
          eventListener$.next(
            new google.maps.Point(
              touchEvent.touches[0].clientX,
              touchEvent.touches[0].clientY - 56
            )
          );
        }
      );
      mouseMoveListener = google.maps.event.addDomListener(
        mapDiv,
        'mousemove',
        mouseEvent => {
          eventListener$.next(
            new google.maps.Point(mouseEvent.offsetX, mouseEvent.offsetY)
          );
        }
      );

      const overlayCompleteListener = this.drawingManager.addListener(
        'overlaycomplete',
        () => {
          touchMoveListener.remove();
          mouseMoveListener.remove();
          eventListener$.complete();
          startMarker.setMap(null);
          startMarker = null;
          startPoint = null;
          overlayCompleteListener.remove();
        }
      );
    });
  }

  setDrawingModeToRectangle() {
    this.clearCircleRadiusListener();
    this.drawingMode = google.maps.drawing.OverlayType.RECTANGLE;
    this.drawingManager.setDrawingMode(this.drawingMode);
  }

  setDrawingModeToPolygon() {
    this.clearCircleRadiusListener();
    this.drawingMode = google.maps.drawing.OverlayType.POLYGON;
    this.drawingManager.setDrawingMode(this.drawingMode);  }

  searchFor(
    queryString: string,
    bounds?: google.maps.LatLngBoundsLiteral
  ): Observable<GooglePlace[]> {
    return Observable.create((observer: Observer<any>) => {
      if (bounds == null) {
        try {
          const fields = [
            'formatted_address',
            'geometry',
            'icon',
            'id',
            'name',
            'place_id'
          ];
          this.placesService.findPlaceFromQuery(
            { fields: fields, query: queryString },
            (results, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK) {
                observer.next(results.map(place => new GooglePlace(place)));
              } else {
                observer.error(status);
              }
            }
          );
        } catch (err) {
          console.log(err);
        }
      } else {
        const request = {
          bounds: bounds,
          name: queryString
        };
        this.placesService.nearbySearch(request, response => {
          observer.next(response.map(place => new GooglePlace(place)));
        });
      }
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

  getMap() {
    return this.map;
  }

}
