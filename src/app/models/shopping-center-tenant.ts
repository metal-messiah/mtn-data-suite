import { AuditingEntity } from './auditing-entity';

export class ShoppingCenterTenant extends AuditingEntity {

  name: string;
  isAnchor = false;
  isOutparcel = false;
  tenantSqft: number;
  legacyCasingId: number;

  constructor(obj?) {
    super(obj);
    Object.assign(this, obj);
  }
}
