import { SimplifiedBanner } from './simplified-banner';
import { SimplifiedSite } from './simplified-site';
import { Entity } from 'app/models/entity';
import { SimplifiedStoreVolume } from './simplified-store-volume';
import { SimplifiedUserProfile } from './simplified-user-profile';
import { DateUtil } from '../../utils/date-util';

export class SimplifiedStore implements Entity {
    id: number;
    storeName: string;
    storeNumber: string;
    currentStoreStatus: string;
    floating: boolean;
    storeType: string;
    projectIds: number[];
    validatedDate: Date;
    validatedBy: SimplifiedUserProfile;
    areaSales: number;
    areaTotal: number;

    site: SimplifiedSite;
    banner: SimplifiedBanner;
    latestStoreVolume: SimplifiedStoreVolume;

    storeListCount: number;

    constructor(obj) {
        Object.assign(this, obj);
        if (obj.site) {
            this.site = new SimplifiedSite(obj.site);
        }
        if (obj.banner) {
            this.banner = new SimplifiedBanner(obj.banner);
        }
        if (obj.latestStoreVolume) {
            this.latestStoreVolume = new SimplifiedStoreVolume(obj.latestStoreVolume);
        }
        if (obj.validatedBy) {
            this.validatedBy = new SimplifiedUserProfile(obj.validatedBy);
        }
        if (obj.validatedDate) {
            this.validatedDate = DateUtil.getDate(obj.validatedDate);
        }
    }
}
