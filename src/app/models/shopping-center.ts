import { AuditingEntity } from './auditing-entity';

export class ShoppingCenter extends AuditingEntity {
  id: number;
  name: string;
  owner: string;
  legacyLocationId: number;
}
