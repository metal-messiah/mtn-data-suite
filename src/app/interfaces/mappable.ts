import { Coordinates } from '../models/coordinates';

export interface Mappable {
  getCoordinates: () => Coordinates;
  getLabel: () => string;
  getId: () => number;
}
