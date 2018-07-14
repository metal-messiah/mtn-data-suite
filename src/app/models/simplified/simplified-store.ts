import { SimplifiedBanner } from './simplified-banner';
import { SimplifiedSite } from './simplified-site';
import { Entity } from 'app/models/entity';
import { SimplifiedStoreVolume } from './simplified-store-volume';

export class SimplifiedStore implements Entity {

  id: number;
  storeName: string;
  storeNumber: string;
  currentStoreStatus: string;
  floating: boolean;
  storeType: string;
  projectIds: number[];

  site: SimplifiedSite;
  banner: SimplifiedBanner;
  latestStoreVolume: SimplifiedStoreVolume;

  constructor(obj) {
    Object.assign(this, obj);
    if (obj.site != null) {
      this.site = new SimplifiedSite(obj.site);
    }
    if (obj.banner != null) {
      this.banner = new SimplifiedBanner(obj.banner);
    }
    if (obj.latestStoreVolume != null) {
      this.latestStoreVolume = new SimplifiedStoreVolume(obj.latestStoreVolume);
    }
  }
}
