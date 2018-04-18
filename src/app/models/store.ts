import { AuditingEntity } from './auditing-entity';
import { Banner } from './banner';
import { Site } from './site';
import { Mappable } from '../interfaces/mappable';
import { Coordinates } from './coordinates';

export class Store extends AuditingEntity implements Mappable {

  site: Site;
  banner: Banner;

  storeName: string;
  storeType: string;
  dateOpened: Date;
  dateClosed: Date;
  storeNumber: string;
  legacyLocationId: number;
  latestSalesArea: number;
  latestTotalArea: number;
  latestVolume: number;
  latestVolumeDate: Date;
  currentStoreStatus: string;

  constructor(obj?) {
    super(obj);
    Object.assign(this, obj);
    if (obj.site != null) {
      this.site = new Site(obj.site);
    }
    if (obj.banner != null) {
      this.banner = new Banner(obj.banner);
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
