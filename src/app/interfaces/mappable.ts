import { Coordinates } from '../models/coordinates';
import { Entity } from '../models/entity';
import { MarkerType } from '../core/functionalEnums/MarkerType';

import Symbol = google.maps.Symbol;
import Icon = google.maps.Icon;
import MarkerLabel = google.maps.MarkerLabel;

export interface Mappable extends Entity {
  getCoordinates: () => Coordinates;
  getIcon: (zoomLevel: number, markerType?: MarkerType) => string|Icon|Symbol;
  isDraggable: () => boolean;
  getLabel: (zoomLevel: number, markerType?: MarkerType) => string|MarkerLabel;
}
