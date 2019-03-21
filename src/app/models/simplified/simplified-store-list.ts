import { Entity } from '../entity';
import { SimplifiedUserProfile } from './simplified-user-profile';

export class SimplifiedStoreList implements Entity {
    id: number;
    storeListName: string;
    storeCount: number;
    subscriberCount: number;
    subscribers: SimplifiedUserProfile[];
    createdById: number;

    constructor(obj) {
        Object.assign(this, obj);
        if (obj.subscribers) {
            this.subscribers = obj.subscribers.map((user) => new SimplifiedUserProfile(user));
            this.subscriberCount = obj.subscribers.length;
        }

        if (obj.stores) {
            this.storeCount = obj.stores.length;
        }

        if (obj.createdBy) {
            this.createdById = obj.createdBy.id;
        }
    }
}
