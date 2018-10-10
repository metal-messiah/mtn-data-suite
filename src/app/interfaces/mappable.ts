import { Coordinates } from '../models/coordinates';
import { Entity } from '../models/entity';
import { MarkerType } from '../core/functionalEnums/MarkerType';

import Symbol = google.maps.Symbol;
import Icon = google.maps.Icon;
import MarkerLabel = google.maps.MarkerLabel;

export interface Mappable {
  getCoordinates: () => Coordinates;
  getIcon: () => string|Icon|Symbol;
  isDraggable: () => boolean;
  getLabel: () => string|MarkerLabel;
}
