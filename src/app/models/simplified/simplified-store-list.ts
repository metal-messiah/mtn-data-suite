import { Entity } from '../entity';

export class SimplifiedStoreList implements Entity {
    id: number;
    storeListName: string;
    storeCount: number;
    subscriberCount: number;
    createdById: number;

    constructor(obj) {
        Object.assign(this, obj);
    }
}
