import { Coordinates } from '../models/coordinates';
import { Entity } from '../models/entity';

export interface Mappable extends Entity {
  getCoordinates: () => Coordinates;
}
