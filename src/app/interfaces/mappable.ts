import { Coordinates } from '../models/coordinates';

export interface Mappable {
  getCoordinates: () => Coordinates;
  getId: () => number | string;
}
