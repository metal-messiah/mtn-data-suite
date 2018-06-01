import { Coordinates } from '../models/coordinates';
import { Entity } from '../models/entity';
import Symbol = google.maps.Symbol;
import Icon = google.maps.Icon;
import { MarkerType } from '../core/functionalEnums/MarkerType';
import MarkerLabel = google.maps.MarkerLabel;

export interface Mappable extends Entity {
  getCoordinates: () => Coordinates;
  getIcon: (markerType?: MarkerType) => string|Icon|Symbol;
  isDraggable: () => boolean;
  getLabel: (markerType?: MarkerType) => string|MarkerLabel;
}
