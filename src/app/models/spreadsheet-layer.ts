import { MapPointLayer } from './map-point-layer';
import { Mappable } from '../interfaces/mappable';
import { GooglePlace } from './google-place';
import { PgMappable } from './pg-mappable';
import { SpreadsheetMappable } from './spreadsheet-mappable';
import { SpreadsheetRecord } from './spreadsheet-record';

export class SpreadsheetLayer extends MapPointLayer<SpreadsheetMappable> {

  spreadsheetMappables: SpreadsheetMappable[];

  constructor(map: google.maps.Map) {
    super(map);
    this.spreadsheetMappables = [];
  }

  setRecord(spreadsheetRecord: SpreadsheetRecord) {
    this.clearMarkers();
    this.spreadsheetMappables = [];
    const recordMappable = new SpreadsheetMappable(spreadsheetRecord);
    this.createMarkerFromMappable(recordMappable);
    this.addToMap(this.map);
    this.map.setCenter(recordMappable.getCoordinates());
    this.map.setZoom(15);
  }

}
