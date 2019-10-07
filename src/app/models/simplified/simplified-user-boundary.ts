import { Entity } from '../entity';

export class SimplifiedUserBoundary implements Entity {
    id: number;
    boundaryId: number;
    boundaryName: string;

    constructor(obj) {
        Object.assign(this, obj);
    }
}
