/*
  The Map Point Layer should represent a list of Mappables on a map.
  - Mappables is not added to or reduced, but rather replaced (managed externally)
  - Emits marker click events
  - Can be added to and removed from map
 */
import { Coordinates } from './coordinates';
import { Color } from '../core/functionalEnums/Color';

export class MapDataLayer {

  map: google.maps.Map;
  pointFeatures: google.maps.Data.Feature[] = [];
  boundaryFeatures: google.maps.Data.Feature[] = [];

  constructor(map: google.maps.Map, userId: number) {
    this.map = map;
    this.map.data.setStyle(feature => {
      const assigneeId = feature.getProperty('assigneeId');
      return {
        fillColor: 'green',
        fillOpacity: this.map.getZoom() > 11 ? 0.05 : 0.2,
        strokeWeight: 1,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: (assigneeId != null && assigneeId === userId) ? Color.GREEN : Color.BLUE,
          fillOpacity: (assigneeId != null && assigneeId === userId) ? 1 : 0.75,
          scale: (assigneeId != null && assigneeId === userId) ? 5 : 4,
          strokeColor: Color.WHITE,
          strokeWeight: 1
        }
      }
    });
  }

  setDataPoints(coordinateList: Coordinates[]) {
    this.clearDataPoints();
    coordinateList.forEach(coordinates => {
      const feature = new google.maps.Data.Feature({geometry: coordinates});
      feature.setProperty('assigneeId', coordinates['assigneeId']);
      this.pointFeatures.push(this.map.data.add(feature));
    });
  }

  clearDataPoints() {
    this.pointFeatures.forEach(f => this.map.data.remove(f));
  }

  setGeoJsonBoundary(geoJson: Object): google.maps.Data.Feature[] {
    this.clearGeoJsonBoundaries();
    this.boundaryFeatures = this.map.data.addGeoJson(geoJson);
    console.log(this.boundaryFeatures[0].getGeometry().getType());
    const bounds = new google.maps.LatLngBounds();
    this.boundaryFeatures.forEach(feature => {
      feature.getGeometry().forEachLatLng(latLng => bounds.extend(latLng));
    });
    this.map.fitBounds(bounds);
    return this.boundaryFeatures;
  }

  clearGeoJsonBoundaries() {
    this.boundaryFeatures.forEach(feature => this.map.data.remove(feature));
  }

}
