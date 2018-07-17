import { AuditingEntity } from '../auditing-entity';

export class SimplifiedStoreSource extends AuditingEntity {

  sourceName: string;
  sourceNativeId: string;
  sourceStoreName: string;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
  }
}
