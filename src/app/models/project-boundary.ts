import { Feature, FeatureCollection, GeoJSON, Point, Polygon } from 'geojson';
import { GeometryUtil } from '../utils/geometry-util';

export class ProjectBoundary {

  map: google.maps.Map;
  geojson: GeoJSON;
  private editable = false;

  polygons: google.maps.Polygon[] = [];
  circles: google.maps.Circle[] = [];
  rectangles: google.maps.Rectangle[] = [];
  deletionListeners: google.maps.MapsEventListener[] = [];

  constructor(map: google.maps.Map, geojson?: GeoJSON) {
    this.map = map;
    if (geojson) {
      this.setGeoJson(geojson);
    }
  }

  enableDeletion() {
    const arrays: google.maps.MVCObject[][] = [this.polygons, this.circles, this.rectangles];
    arrays.forEach(array =>
      array.forEach(s => {
        const listener = s.addListener('click', () => this.deleteShapeFrom(s, array));
        this.deletionListeners.push(listener);
      })
    );
  }

  private deleteShapeFrom(shape, array) {
    shape.setMap(null);
    const index = array.indexOf(shape);
    array.splice(index, 1);
  }

  disableDeletion() {
    this.deletionListeners.forEach(l => l.remove());
  }

  resetFromGeoJson() {
    this.setGeoJson(this.geojson);
  }

  setGeoJson(geojson: GeoJSON) {
    this.removeFromMap();
    this.polygons = [];
    this.circles = [];
    this.rectangles = [];
    this.deletionListeners = [];
    this.geojson = geojson;
    if (this.geojson && this.geojson.type === 'FeatureCollection') {
      if (this.geojson.features) {
        this.geojson.features.forEach(feature => this.parseFeature(feature))
      }
    }
  }

  toGeoJson() {
    const features = [];
    this.polygons.forEach(p => features.push(GeometryUtil.googlePolygonToGeoJsonFeature(p)));
    this.circles.forEach(c => features.push(GeometryUtil.googleCircleToGeoJsonFeature(c)));
    this.rectangles.forEach(r => features.push(GeometryUtil.googleRectangleToGeoJsonFeature(r)));

    const geoJson = {
      type: 'FeatureCollection',
      features: features
    };
    return JSON.stringify(geoJson);
  }

  setEditable(editable: boolean) {
    if (this.editable !== editable) {
      this.editable = editable;
      this.polygons.forEach(p => p.setEditable(editable));
      this.circles.forEach(c => {
        c.setEditable(editable);
        c.setDraggable(editable);
      });
      this.rectangles.forEach(r => {
        r.setEditable(editable);
        r.setDraggable(editable);
      });
    }
  }

  isEditable() {
    return this.editable;
  }

  zoomToBounds() {
    const bounds = new google.maps.LatLngBounds();
    this.polygons.forEach(polygon => {
      polygon.getPath().getArray().forEach(latLng => bounds.extend(latLng));
    });
    this.circles.forEach(circle => {
      const circleBoundary = circle.getBounds();
      bounds.extend(circleBoundary.getNorthEast());
      bounds.extend(circleBoundary.getSouthWest());
    });
    this.map.fitBounds(bounds);
  }

  removeFromMap() {
    this.polygons.forEach(polygon => polygon.setMap(null));
    this.circles.forEach(circle => circle.setMap(null));
    this.rectangles.forEach(rectangle => rectangle.setMap(null))
  }

  addShape(shape) {
    shape.overlay.setEditable(this.editable);
    if (shape.type === google.maps.drawing.OverlayType.CIRCLE) {
      this.circles.push(shape.overlay);
    } else if (shape.type === google.maps.drawing.OverlayType.POLYGON) {
      this.polygons.push(shape.overlay);
    } else if (shape.type === google.maps.drawing.OverlayType.RECTANGLE) {
      this.rectangles.push(shape.overlay);
    }
  }

  hasShapes() {
    return this.polygons.length > 0 || this.circles.length > 0 || this.rectangles.length > 0;
  }

  private parseCircle(point: Point, radius: number) {
    const lng = point.coordinates[0];
    const lat = point.coordinates[1];
    const gCircle = new google.maps.Circle();
    gCircle.setCenter({lat: lat, lng: lng});
    gCircle.setRadius(radius);
    gCircle.setMap(this.map);
    this.circles.push(gCircle);
  }

  private parseFeature(feature: Feature) {
    if (feature.geometry.type === 'Polygon') {
      this.parsePolygon(feature.geometry);
    } else if (feature.geometry.type === 'Point' && feature.properties.radius) {
      this.parseCircle(feature.geometry, feature.properties.radius);
    } else {
      throw new Error('Can\'t identify geometry type');
    }
  }

  private parsePolygon(polygon: Polygon) {
    const poly: google.maps.Polygon = GeometryUtil.geoJsonPolygonToGooglePolygon(polygon);
    if (GeometryUtil.polygonIsRectangle(poly)) {
      const rectangle = GeometryUtil.getRectangleFromPolygon(poly);
      rectangle.setMap(this.map);
      this.rectangles.push(rectangle);
    } else {
      poly.setMap(this.map);
      this.polygons.push(poly);
    }
  }

}
