import { Entity } from '../entity';
import { SimplifiedUserProfile } from './simplified-user-profile';

export class SimplifiedStoreList implements Entity {
    id: number;
    storeListName: string;
    storeCount: number;
    storeIds: number[];
    subscriberCount: number;
    subscribers: SimplifiedUserProfile[];
    createdBy: SimplifiedUserProfile;

    constructor(obj) {
        Object.assign(this, obj);
        if (obj.subscribers) {
            this.subscribers = obj.subscribers.map((user) => new SimplifiedUserProfile(user));
            this.subscriberCount = obj.subscribers.length;
        }

        if (obj.stores) {
            this.storeCount = obj.stores.length;
            this.storeIds = obj.stores.map(store => store.id);
        }

        if (obj.createdBy) {
            this.createdBy = new SimplifiedUserProfile(obj.createdBy);
        }
    }
}
