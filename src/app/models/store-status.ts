import { AuditingEntity } from './auditing-entity';
import { SimplifiedStore } from './simplified-store';

export class StoreStatus extends AuditingEntity {

  store: SimplifiedStore;
  status: string;
  statusStartDate: Date;
  legacyLocationId: number;
  legacyCasingId: number;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.store != null) {
      this.store = new SimplifiedStore(obj.store);
    }
  }
}
