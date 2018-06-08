import { AuditingEntity } from './auditing-entity';

export class ShoppingCenterTenant extends AuditingEntity {

  name: string;
  isAnchor = false;
  outparcel = false;
  tenantSqft: number;
  legacyCasingId: number;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
  }
}
