import { Color } from '../core/functionalEnums/Color';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { Coordinates } from './coordinates';
import Icon = google.maps.Icon;
import Symbol = google.maps.Symbol;
import MarkerLabel = google.maps.MarkerLabel;
import { Mappable } from '../interfaces/mappable';

export class CoordinateMappable implements Mappable {

  id: number;
  private coordinates: Coordinates;

  constructor(coordinates: Coordinates) {
    this.coordinates = coordinates;
  }

  getCoordinates(): Coordinates {
    return this.coordinates;
  };

  isDraggable(): boolean {
    return false;
  }

  getLabel(markerType?: MarkerType): string | MarkerLabel {
    return null;
  }

  getIcon(markerType?: MarkerType): string | Icon | Symbol {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: Color.BLUE,
      fillOpacity: 0.5,
      scale: 3,
      strokeColor: Color.WHITE,
      strokeWeight: 1,
      labelOrigin: new google.maps.Point(0, -2)
    };
  }
}
