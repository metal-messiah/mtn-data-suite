import { AuditingEntity } from './auditing-entity';

export class ShoppingCenterCasing extends AuditingEntity {

  casingDate: Date;
  note: string;
  ratingParkingLot: string;
  ratingBuildings: string;
  ratingLighting: string;
  ratingSynergy: string;
  legacyCasingId: number;

  constructor(obj?) {
    super(obj);
    Object.assign(this, obj);
  }
}
