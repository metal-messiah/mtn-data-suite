import { Entity } from '../models/entity';
import { Mappable } from './mappable';
import { SimplifiedSite } from '../models/simplified/simplified-site';
import { Site } from '../models/full/site';

export interface EntityMappable extends Mappable {
  getEntity: () => Entity;
  updateEntity: (entity: Entity) => void;
  setMoving: (moving: boolean) => void;
  setSelected: (selected: boolean) => void;
  getSite: () => (Site | SimplifiedSite);
}
