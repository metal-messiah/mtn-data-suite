import { AuditingEntity } from './auditing-entity';

export class ShoppingCenter extends AuditingEntity {

  name: string;
  owner: string;
  legacyLocationId: number;

  constructor(obj?) {
    super(obj);
    Object.assign(this, obj);
  }
}
