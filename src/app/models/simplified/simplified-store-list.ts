import { Entity } from '../entity';
import { SimplifiedUserProfile } from './simplified-user-profile';

export class SimplifiedStoreList implements Entity {
    id: number;
    storeListName: string;
    storeCount: number;
    subscribers: SimplifiedUserProfile[];
    createdById: number;

    constructor(obj) {
        Object.assign(this, obj);
        if (obj.subscribers) {
            this.subscribers = obj.subscribers.map((user) => new SimplifiedUserProfile(user));
        }
    }
}
