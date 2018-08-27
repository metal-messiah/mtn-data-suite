import { Entity } from '../models/entity';
import { Mappable } from './mappable';

export interface EntityMappable extends Mappable {
  getEntity: () => Entity;
  updateEntity: (entity: Entity) => void;
  setMoving: (moving: boolean) => void;
  setSelected: (selected: boolean) => void;
}
