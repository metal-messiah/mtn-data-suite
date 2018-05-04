import { AuditingEntity } from './auditing-entity';

export class ShoppingCenterAccess extends AuditingEntity {

  accessType: string;
  hasLeftIn = false;
  oneWayRoad = false;
  hasLeftOut = false;
  hasTrafficLight = false;
  hasRightIn = false;
  hasRightOut = false;
  legacyCasingId: number;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
  }
}
