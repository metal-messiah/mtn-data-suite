import { SimplifiedBanner } from './simplified-banner';
import { SimplifiedSite } from './simplified-site';
import { Entity } from 'app/models/entity';

export class SimplifiedStore implements Entity {

  id: number;
  site: SimplifiedSite;
  storeName: string;
  storeNumber: string;
  banner: SimplifiedBanner;
  currentStoreStatus: string;
  floating: boolean;
  storeType: string;

  constructor(obj) {
    Object.assign(this, obj);
    if (obj.site != null) {
      this.site = new SimplifiedSite(obj.site);
    }
    if (obj.banner != null) {
      this.banner = new SimplifiedBanner(obj.banner);
    }
  }
}
