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
  selectedIds: Set<number>;
  coordinateList: Coordinates[];

  constructor(map: google.maps.Map, userId: number, selectedIdSet: Set<number>) {
    this.map = map;
    this.map.data.setStyle((feature: google.maps.Data.Feature) => {
      const assigneeId = feature.getProperty('assigneeId');
      const siteId = feature.getProperty('siteId');
      const selected = this.selectedIds.has(siteId);
      return {
        fillColor: 'green',
        fillOpacity: this.map.getZoom() > 11 ? 0.05 : 0.2,
        strokeWeight: 1,
        editable: true,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: (assigneeId != null && assigneeId === userId) ? Color.GREEN : Color.BLUE,
          fillOpacity: (assigneeId != null && assigneeId === userId) ? 1 : 0.75,
          scale: (assigneeId != null && assigneeId === userId) ? 5 : 4,
          strokeColor: selected ? Color.YELLOW : Color.WHITE,
          strokeWeight: selected ? 2 : 1
        }
      }
    });
    this.selectedIds = selectedIdSet;
  }

  setDataPoints(coordinateList: Coordinates[]) {
    this.coordinateList = coordinateList;
    this.clearDataPoints();
    coordinateList.forEach(coordinates => {
      const feature = new google.maps.Data.Feature({geometry: coordinates});
      feature.setProperty('assigneeId', coordinates['assigneeId']);
      feature.setProperty('siteId', coordinates['id']);
      this.pointFeatures.push(this.map.data.add(feature));
    });
  }

  refresh() {
    this.setDataPoints(this.coordinateList);
  }

  clearDataPoints() {
    this.pointFeatures.forEach(f => this.map.data.remove(f));
  }

  setGeoJsonBoundary(geoJson: Object): google.maps.Data.Feature[] {
    this.clearGeoJsonBoundaries();
    this.boundaryFeatures = this.map.data.addGeoJson(geoJson);
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
