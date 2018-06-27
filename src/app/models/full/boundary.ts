import { AuditingEntity } from '../auditing-entity';

export class Boundary extends AuditingEntity {

  geojson: string;
  legacyProjectId: number;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
  }
}
