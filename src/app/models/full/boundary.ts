import { AuditingEntity } from '../auditing-entity';

export class Boundary extends AuditingEntity {
  geojson: string;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
  }
}
