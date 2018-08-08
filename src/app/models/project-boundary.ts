import { Feature, FeatureCollection, GeoJSON, Point, Polygon } from 'geojson';
import { Coordinates } from './coordinates';

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
    this.polygons.forEach(p => features.push(this.getPolygonFeatureFromPolygon(p)));
    this.circles.forEach(c => features.push(this.getPointFeatureFromCircle(c)));
    this.rectangles.forEach(r => features.push(this.getPolygonFeatureFromRectangle(r)));

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

  private convertRectangleToPolygon(rectangle) {
    const bounds = rectangle.getBounds().toJSON();
    const ne = {lat: bounds.north, lng: bounds.east};
    const nw = {lat: bounds.north, lng: bounds.west};
    const se = {lat: bounds.south, lng: bounds.east};
    const sw = {lat: bounds.south, lng: bounds.west};
    return new google.maps.Polygon({paths: [ne, nw, sw, se]});
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

  // Test for right/left handedness (right = counter)
  // (https://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order)
  private ringIsClockwise(ring) {
    let sum = 0;
    for (let i = 1; i < ring.length; i++) {
      const x2 = ring[i][0];
      const x1 = ring[i - 1][0];
      const y2 = ring[i][1];
      const y1 = ring[i - 1][1];
      sum += (x2 - x1) * (y2 + y1);
    }
    return sum > 0;
  }

  private getPolygonFeatureFromRectangle(rectangle: google.maps.Rectangle): Feature {
    return this.getPolygonFeatureFromPolygon(this.convertRectangleToPolygon(rectangle));
  }

  private getPointFeatureFromCircle(circle: google.maps.Circle): Feature {
    return {
      type: 'Feature',
      properties: {radius: circle.getRadius()},
      geometry: {
        type: 'Point',
        coordinates: [circle.getCenter().lng(), circle.getCenter().lat()]
      }
    }
  }

  private getPolygonFeatureFromPolygon(polygon: google.maps.Polygon): Feature {
    const rings = [];
    polygon.getPaths().forEach((path, index) => {
      const ring = [];
      path.forEach(latLng => ring.push([latLng.lng(), latLng.lat()]));
      ring.push(ring[0]);
      const isClockwise = this.ringIsClockwise(ring);
      if ((index === 0 && isClockwise) || (index !== 0 && !isClockwise)) {
        rings.push(ring.reverse());
      } else {
        rings.push(ring);
      }
    });
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: rings
      }
    }
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
    const paths = [];
    polygon.coordinates.forEach((ring) => {
      const path: Coordinates[] = [];
      ring.forEach(coordinates => {
        const lng = coordinates[0];
        const lat = coordinates[1];
        if (path.length > 0) {
          const prevCoord = path[path.length - 1];
          if (prevCoord.lat !== lat || prevCoord.lng !== lng) {
            path.push({lat: lat, lng: lng})
          }
          // else skip (eliminates duplicate points
        } else {
          path.push({lat: lat, lng: lng})
        }
      });
      paths.push(path);
    });
    if (this.pathIsRectangle(paths)) {
      this.rectangles.push(new google.maps.Rectangle({bounds: this.getRectanglePathBounds(paths), map: this.map}));
    } else {
      this.polygons.push(new google.maps.Polygon({paths: paths, map: this.map}));
    }
  }

  private getRectanglePathBounds(paths: Coordinates[][]): google.maps.LatLngBounds {
    const bounds = new google.maps.LatLngBounds();
    paths[0].forEach(coordinate => {
      bounds.extend(coordinate);
    });
    return bounds;
  }

  private pathIsRectangle(paths: Coordinates[][]) {
    if (paths.length !== 1) {
      return false;
    }
    const path = paths[0];
    if (path.length !== 5) {
      return false;
    }
    const bounds = new google.maps.LatLngBounds();
    path.forEach(coordinate => {
      bounds.extend(coordinate);
    });
    const north = bounds.getNorthEast().lat();
    const east = bounds.getNorthEast().lng();
    const south = bounds.getSouthWest().lat();
    const west = bounds.getSouthWest().lng();
    return path.every(coordinate => {
      return ((coordinate.lat === north || coordinate.lat === south) && (coordinate.lng === east || coordinate.lng === west));
    });
  }

}
