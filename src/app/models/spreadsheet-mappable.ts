import { Color } from '../core/functionalEnums/Color';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { Coordinates } from './coordinates';
import Icon = google.maps.Icon;
import Symbol = google.maps.Symbol;
import MarkerLabel = google.maps.MarkerLabel;
import { Mappable } from '../interfaces/mappable';
import { SpreadsheetRecord } from './spreadsheet-record';

export class SpreadsheetMappable implements Mappable {

  public id: string;
  private readonly coordinates: Coordinates;

  constructor(record: SpreadsheetRecord) {
    this.id = record.uniqueId;
    this.coordinates = record.coordinates;
  }

  getCoordinates(): Coordinates {
    return this.coordinates;
  };

  isDraggable(): boolean {
    return false;
  }

  getLabel(zoom: number, markerType?: MarkerType): string|MarkerLabel {
    return null;
  }

  getIcon(zoom: number, markerType?: MarkerType): string | Icon | Symbol {
    return {
      path: MarkerShape.CIRCLE,
      fillColor: Color.PURPLE,
      fillOpacity: 0.5,
      scale: 0.5,
      strokeColor: Color.PURPLE_DARK,
      strokeWeight: 2.5,
      anchor: new google.maps.Point(50, 50),
      labelOrigin: new google.maps.Point(255, 230),
      rotation: 0
    };
  }
}
