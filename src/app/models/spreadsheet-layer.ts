import { MapPointLayer } from './map-point-layer';
import { SpreadsheetMappable } from './spreadsheet-mappable';
import { SpreadsheetRecord } from './spreadsheet-record';
import { MapService } from '../core/services/map.service';

export class SpreadsheetLayer extends MapPointLayer<SpreadsheetMappable> {
	spreadsheetMappables: SpreadsheetMappable[];

	constructor(mapService: MapService) {
		super(mapService);
		this.spreadsheetMappables = [];
	}

	setRecord(spreadsheetRecord: SpreadsheetRecord, draggable?: boolean) {
		draggable = draggable || false;
		this.clearMarkers();
		this.spreadsheetMappables = [];
		const recordMappable = new SpreadsheetMappable(spreadsheetRecord);
		recordMappable.setDraggable(draggable);
		this.createMarkerFromMappable(recordMappable);
		this.addToMap(this.mapService.getMap());
		this.mapService.setCenter(recordMappable.getCoordinates());
		this.mapService.setZoom(15);
	}
}
