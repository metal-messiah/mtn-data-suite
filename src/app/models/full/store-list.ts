import { AuditingEntity } from '../auditing-entity';
import { SimplifiedUserProfile } from '../simplified/simplified-user-profile';
import { SimplifiedStore } from '../simplified/simplified-store';

export class StoreList extends AuditingEntity {
    storeListName: string;

    stores: SimplifiedStore[];
    subscribers: SimplifiedUserProfile[];

    constructor(obj) {
        super(obj);
        Object.assign(this, obj);

        if (obj.stores != null) {
            this.stores = obj.stores.map((store) => new SimplifiedStore(store));
        }
        if (obj.subscribers != null) {
            this.subscribers = obj.subscribers.map((user) => new SimplifiedUserProfile(user));
        }
    }
}
