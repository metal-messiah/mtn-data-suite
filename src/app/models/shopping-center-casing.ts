import {AuditingEntity} from './auditing-entity';
import { Project } from './project';
import { ShoppingCenter } from './shopping-center';
import { Store } from './store';
import { Interaction } from './interaction';

export class ShoppingCenterCasing extends AuditingEntity {
  id: number;
  casingDate: Date;
  note: string;
  ratingParkingLot: string;
  ratingBuildings: string;
  ratingLighting: string;
  ratingSynergy: string;
  legacyCasingId: number;

  shoppingCenter: ShoppingCenter;

  interactions: Interaction[];

}
