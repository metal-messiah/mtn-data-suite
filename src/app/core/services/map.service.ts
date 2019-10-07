/// <reference types="@types/googlemaps" />

import { Injectable } from '@angular/core';
import { GooglePlace } from '../../models/google-place';
import { LatLng } from '../../models/latLng';
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageService } from './storage.service';

import * as MarkerWithLabel from '@google/markerwithlabel';
import { MarkerShape } from '../functionalEnums/MarkerShape';
import { Color } from '../functionalEnums/Color';


/*
  The MapService should
  - Initialize a map
  - Draw overlays as specified by components
  - Expose controls to pan and zoom
  - Expose methods to get the center, bounds and zoom level
 */
@Injectable()
export class MapService {

  private readonly ST_MAP_PERSPECTIVE = 'mapPerspective';

  private map: google.maps.Map;

  boundsChanged$: Subject<{ east; north; south; west }>;
  mapClick$: Subject<LatLng>;

  cancelCircleRadiusListeners: () => void;

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

  constructor(private snackBar: MatSnackBar,
              private storageService: StorageService) {
    this.dataPointFeatures = [];
  }

  addControl(control: HTMLElement, position: google.maps.ControlPosition = google.maps.ControlPosition.RIGHT_BOTTOM) {
    this.map.controls[position].push(control);
  }

  initialize(element: HTMLElement) {
    // Create map
    this.map = new google.maps.Map(element, {
      center: {lat: 39.8283, lng: -98.5795},
      zoom: 8,
      fullscreenControl: false,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
      }
    });
    this.map.getStreetView().setOptions({imageDateControl: true});
    this.placesService = new google.maps.places.PlacesService(this.map);
    this.boundsChanged$ = new Subject<{ east; north; south; west }>();
    this.mapClick$ = new Subject<LatLng>();
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
    this.map.addListener('click', event => this.mapClick$.next(event.latLng.toJSON()));

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
    this.storageService.getOne(this.ST_MAP_PERSPECTIVE).subscribe(perspective => {
      if (perspective) {
        perspective = JSON.parse(perspective);
        this.map.setCenter(perspective['center']);
        this.map.setZoom(perspective['zoom']);
        this.map.setMapTypeId(perspective['mapTypeId']);
      }
    });
  }

  savePerspective() {
    this.storageService.set(this.ST_MAP_PERSPECTIVE, JSON.stringify(this.getPerspective())).subscribe();
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

    // Re-engage circle radius listener
    if (this.drawingMode === google.maps.drawing.OverlayType.CIRCLE) {
      this.setDrawingModeToCircle();
    }

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
    if (this.cancelCircleRadiusListeners != null) {
      this.cancelCircleRadiusListeners();
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
    const mapDiv = this.map.getDiv();
    let startPoint: google.maps.LatLng;
    let startMarker: MarkerWithLabel;
    let touchMoveListener: google.maps.MapsEventListener;
    let mouseMoveListener: google.maps.MapsEventListener;

    const onMoved = (point: google.maps.Point) => {
      const latLng = MapService.point2LatLng(point, this.map);
      startMarker.setPosition(latLng);
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        startPoint,
        latLng
      );
      startMarker.labelContent = MapService.getDistanceLabel(distance);
    };

    const onStart = (e) => {
      if (!startMarker) {
        startMarker = new MarkerWithLabel(this.map.getCenter());
        startPoint = e.latLng;
        startMarker.setMap(this.map);
        startMarker.setOptions({
          position: startPoint,
          icon: {
            path: MarkerShape.DEFAULT,
            fillColor: Color.PURPLE,
            fillOpacity: 1,
            scale: 0.075,
            strokeColor: Color.PURPLE_DARK,
            strokeWeight: 2.5,
            anchor: new google.maps.Point(255, 510),
            labelOrigin: new google.maps.Point(255, 230),
          },
          labelContent: '0 mi',
          labelAnchor: new google.maps.Point(0, 60),
          labelClass: 'db-marker-full-label-active',
          labelInBackground: false
        });


        touchMoveListener = google.maps.event.addDomListener(mapDiv, 'touchmove',
          touchEvent => {
            const point = new google.maps.Point(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY - 56);
            onMoved(point);
          }
        );
        mouseMoveListener = google.maps.event.addDomListener(mapDiv, 'mousemove',
          mouseEvent => {
            const point = new google.maps.Point(mouseEvent.offsetX, mouseEvent.offsetY);
            onMoved(point);
          }
        );

        const overlayCompleteListener = this.drawingManager.addListener(
          'overlaycomplete',
          () => {
            touchMoveListener.remove();
            mouseMoveListener.remove();
            startMarker.setMap(null);
            startMarker = null;
            startPoint = null;
            overlayCompleteListener.remove();
          }
        );
      }
    };

    const touchListener = this.map.addListener('touchstart', e => onStart(e));
    const mouseListener = this.map.addListener('mousedown', e => onStart(e));

    this.cancelCircleRadiusListeners = () => {
      touchListener.remove();
      mouseListener.remove();
    };
  }

  setDrawingModeToRectangle() {
    this.clearCircleRadiusListener();
    this.drawingMode = google.maps.drawing.OverlayType.RECTANGLE;
    this.drawingManager.setDrawingMode(this.drawingMode);
  }

  setDrawingModeToPolygon() {
    this.clearCircleRadiusListener();
    this.drawingMode = google.maps.drawing.OverlayType.POLYGON;
    this.drawingManager.setDrawingMode(this.drawingMode);
  }

  searchFor(
    queryString: string,
    bounds?: google.maps.LatLngBoundsLiteral
  ): Observable<GooglePlace[]> {
    const subject = new Subject<any>();

    const callback = (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        subject.next(results.map(r => new GooglePlace(r)));
      } else {
        subject.error(status);
      }
    };

    if (bounds == null) {
      const fields = [
        'formatted_address',
        'geometry',
        'icon',
        'id',
        'name',
        'place_id'
      ];

      this.placesService.findPlaceFromQuery({fields: fields, query: queryString}, callback);
    } else {
      const request = {
        bounds: bounds,
        name: queryString
      };
      this.placesService.nearbySearch(request, callback);
    }

    return subject;
  }

  fitToPoints(points: LatLng[], label?: string) {
    const bounds = new google.maps.LatLngBounds();
    points.forEach(pt => bounds.extend(pt));
    this.map.fitBounds(bounds);

    if (label) {
      this.snackBar.open(label, null, {duration: 2000});
    }

    const rectangle = new google.maps.Rectangle({
      strokeColor: 'orange',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: null,
      fillOpacity: 0.35,
      map: this.map,
      bounds: bounds
    });

    this.fade(rectangle, 0.35);
  }

  private fade(rect: google.maps.Rectangle, fillOpacity: number) {
    const strokeOpacity = (fillOpacity + 0.45) / 2;
    rect.setOptions({fillOpacity, strokeOpacity});
    const newOpacity = fillOpacity - 0.01;
    if (newOpacity >= 0) {
      setTimeout(() => this.fade(rect, newOpacity), 50);
    } else {
      rect.setMap(null);
    }
  }

  getMap() {
    return this.map;
  }
}
