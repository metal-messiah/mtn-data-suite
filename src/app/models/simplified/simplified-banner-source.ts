import { AuditingEntity } from '../auditing-entity';
import { SimplifiedBanner } from '../simplified/simplified-banner';

export class SimplifiedBannerSource extends AuditingEntity {
    sourceName: string;
    sourceBannerName: string;
    banner: SimplifiedBanner;
    status: string;
    storeSourceCount: number;

    constructor(obj?) {
        super(obj);
        Object.assign(this, obj);
    }
}
