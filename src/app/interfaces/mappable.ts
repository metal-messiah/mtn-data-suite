import { Coordinates } from '../models/coordinates';

export interface Mappable {
  getCoordinates: () => Coordinates;
  getLabel: () => string | {color: string, fontWeight: string, text: string};
  getId: () => number | string;
}
