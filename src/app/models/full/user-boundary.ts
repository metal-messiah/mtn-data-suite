import { AuditingEntity } from '../auditing-entity';

export class UserBoundary extends AuditingEntity {

    geojson: string;
    boundaryName?: string;

    constructor(obj) {
        super(obj);
        Object.assign(this, obj);
    }
}
