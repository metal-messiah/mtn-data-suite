import { AuditingEntity } from './auditing-entity';
import { SimplifiedInteraction } from './simplified-interaction';

export class ShoppingCenterCasing extends AuditingEntity {

  casingDate: Date;
  note: string;
  ratingParkingLot: string;
  ratingBuildings: string;
  ratingLighting: string;
  ratingSynergy: string;
  legacyCasingId: number;

  interactions: SimplifiedInteraction[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.interactions != null) {
      this.interactions = obj.interactions.map(interaction => new SimplifiedInteraction(interaction));
    }
  }
}
