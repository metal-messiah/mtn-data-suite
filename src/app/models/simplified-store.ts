import { Mappable } from '../interfaces/mappable';
import { Coordinates } from './coordinates';
import { SimplifiedBanner } from './simplified-banner';
import { SimplifiedSite } from './simplified-site';
import { Entity } from 'app/models/entity';

export class SimplifiedStore implements Entity, Mappable {

  id: number;
  site: SimplifiedSite;
  storeName: string;
  storeNumber: string;
  banner: SimplifiedBanner;
  currentStoreStatus: string;

  constructor(obj) {
    Object.assign(this, obj);
    if (obj.site != null) {
      this.site = new SimplifiedSite(obj.site);
    }
    if (obj.banner != null) {
      this.banner = new SimplifiedBanner(obj.banner);
    }
  }

  getLabel() {
    let label = null;
    if (this.banner != null) {
      label = this.banner.bannerName;
    } else {
      label = this.storeName;
    }
    if (this.storeNumber != null) {
      label = `${label} (${this.storeNumber})`;
    }
    return label;
  }

  getCoordinates(): Coordinates {
    return this.site.getCoordinates();
  };
}
