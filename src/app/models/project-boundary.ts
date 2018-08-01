import { Feature, GeoJSON, Point, Polygon } from 'geojson';
import { Coordinates } from './coordinates';

export class ProjectBoundary {

  map: google.maps.Map;
  geojson: GeoJSON;
  editable = false;

  polygons: google.maps.Polygon[] = [];
  circles: google.maps.Circle[] = [];

  constructor(map: google.maps.Map, geojson?: string) {
    this.map = map;
    if (geojson) {
      this.setGeoJson(geojson);
    }
  }

  resetFromGeoJson() {
    this.setGeoJson(JSON.stringify(this.geojson));
  }

  setGeoJson(geojson: string) {
    this.geojson = JSON.parse(geojson);
    this.removeFromMap();
    this.polygons = [];
    this.circles = [];
    if (this.geojson.type === 'FeatureCollection') {
      if (this.geojson.features) {
        this.geojson.features.forEach(feature => this.parseFeature(feature))
      }
    }
  }

  parseFeature(feature: Feature) {
    if (feature.geometry.type === 'Polygon') {
      this.parsePolygon(feature.geometry);
    } else if (feature.geometry.type === 'Point' && feature.properties.radius) {
      this.parseCircle(feature.geometry, feature.properties.radius);
    } else {
      throw new Error('Can\'t identify geometry type');
    }
  }

  parsePolygon(polygon: Polygon) {
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
    const gPolygon = new google.maps.Polygon();
    gPolygon.setPaths(paths);
    gPolygon.setMap(this.map);
    this.polygons.push(gPolygon);
  }

  parseCircle(point: Point, radius: number) {
    const lng = point.coordinates[0];
    const lat = point.coordinates[1];
    const gCircle = new google.maps.Circle();
    gCircle.setCenter({lat: lat, lng: lng});
    gCircle.setRadius(radius);
    gCircle.setMap(this.map);
    this.circles.push(gCircle);
  }

  toGeoJson() {
    // TODO Create GeoJson from Shapes
    const features = [];
    this.polygons.forEach(p => {
      const rings = [];
      p.getPaths().forEach((path, index) => {
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
      features.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: rings
        }
      });
    });
    this.circles.forEach(c => {
      features.push({
        type: 'Feature',
        properties: {radius: c.getRadius()},
        geometry: {
          type: 'Point',
          coordinates: [c.getCenter().lng(), c.getCenter().lat()]
        }
      });
    });

    const geoJson = {
      type: 'FeatureCollection',
      features: features
    };
    return JSON.stringify(geoJson);
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

  setEditable(editable: boolean) {
    this.editable = editable;
    this.polygons.forEach(p => p.setEditable(editable));
    this.circles.forEach(c => {
      c.setEditable(editable);
      c.setDraggable(editable);
    });
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
  }

  addShape(shape) {
    shape.overlay.setEditable(this.editable);
    if (shape.type === google.maps.drawing.OverlayType.CIRCLE) {
      this.circles.push(shape.overlay);
    } else if (shape.type === google.maps.drawing.OverlayType.POLYGON) {
      this.polygons.push(shape.overlay);
    }
  }

}
