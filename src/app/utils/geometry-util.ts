import { Feature, Polygon } from 'geojson';
import MVCArray = google.maps.MVCArray;
import LatLng = google.maps.LatLng;

export class GeometryUtil {

  static getGeoJsonFromShape(shape: { type: google.maps.drawing.OverlayType, overlay }) {
    if (shape.type === google.maps.drawing.OverlayType.POLYGON) {
      return GeometryUtil.googlePolygonToGeoJsonFeature(shape.overlay);
    } else if (shape.type === google.maps.drawing.OverlayType.CIRCLE) {
      return GeometryUtil.googleCircleToGeoJsonFeature(shape.overlay);
    } else if (shape.type === google.maps.drawing.OverlayType.RECTANGLE) {
      return GeometryUtil.googleRectangleToGeoJsonFeature(shape.overlay);
    }
  }

  static googlePolygonToGeoJsonFeature(polygon: google.maps.Polygon): Feature {
    const rings = [];
    polygon.getPaths().forEach((path, index) => {
      const ring = [];
      path.forEach(latLng => ring.push([latLng.lng(), latLng.lat()]));
      ring.push(ring[0]);
      const isClockwise = GeometryUtil.ringIsClockwise(ring);
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
    };
  }

  static googleRectangleToGeoJsonFeature(rectangle: google.maps.Rectangle): Feature {
    const bounds = rectangle.getBounds().toJSON();
    const ne = {lat: bounds.north, lng: bounds.east};
    const nw = {lat: bounds.north, lng: bounds.west};
    const se = {lat: bounds.south, lng: bounds.east};
    const sw = {lat: bounds.south, lng: bounds.west};
    const poly = new google.maps.Polygon({paths: [ne, nw, sw, se]});
    return GeometryUtil.googlePolygonToGeoJsonFeature(poly);
  }

  static googleCircleToGeoJsonFeature(circle: google.maps.Circle): Feature {
    return {
      type: 'Feature',
      properties: {radius: circle.getRadius()},
      geometry: {
        type: 'Point',
        coordinates: [circle.getCenter().lng(), circle.getCenter().lat()]
      }
    };
  }

  // Test for right/left handedness (right = counter)
  // (https://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order)
  static ringIsClockwise(ring) {
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

  static geoJsonPolygonToGooglePolygon(polygon: Polygon): google.maps.Polygon {
    const paths = [];
    polygon.coordinates.forEach((ring) => {
      const path: LatLng[] = [];
      ring.forEach(coordinates => {
        const lng = coordinates[0];
        const lat = coordinates[1];
        if (path.length > 0) {
          const prevCoord = path[path.length - 1];
          if (prevCoord.lat() !== lat || prevCoord.lng() !== lng) {
            path.push(new LatLng(lat, lng));
          }
          // else skip (eliminates duplicate points
        } else {
          path.push(new LatLng(lat, lng));
        }
      });
      paths.push(path);
    });
    return new google.maps.Polygon({paths: paths});
  }

  static polygonIsRectangle(polygon: google.maps.Polygon) {
    const paths = polygon.getPaths();
    if (paths.getLength() !== 1) {
      return false;
    }
    const path: MVCArray<LatLng> = polygon.getPath();
    if (path.getLength() !== 4) {
      return false;
    }
    const bounds = new google.maps.LatLngBounds();
    path.forEach(coordinate => bounds.extend(coordinate));
    const north = bounds.getNorthEast().lat();
    const east = bounds.getNorthEast().lng();
    const south = bounds.getSouthWest().lat();
    const west = bounds.getSouthWest().lng();
    return path.getArray().every((coordinate: LatLng) => {
      return ((coordinate.lat() === north || coordinate.lat() === south) && (coordinate.lng() === east || coordinate.lng() === west));
    });
  }

  static getRectangleFromPolygon(polygon: google.maps.Polygon): google.maps.Rectangle {
    const bounds = new google.maps.LatLngBounds();
    polygon.getPath().forEach((latLng: google.maps.LatLng) => bounds.extend(latLng));
    return new google.maps.Rectangle({bounds: bounds});
  }

}
