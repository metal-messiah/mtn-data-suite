import { Entity } from '../entity';

export class SimplifiedUserProfile implements Entity {
    id: number;
    email: string;
    name: string;

    constructor(obj) {
        Object.assign(this, obj);
        if (obj.firstName && obj.lastName) {
            this.name = `${obj.firstName} ${obj.lastName}`;
        }
    }
}
