import { AuditingEntity } from './auditing-entity';
import { Mappable } from '../interfaces/mappable';
import { Coordinates } from './coordinates';
import { SimplifiedStoreCasing } from './simplified-store-casing';
import { SimplifiedBanner } from './simplified-banner';
import { SimplifiedSite } from './simplified-site';
import { SimplifiedStoreModel } from './simplified-store-model';
import { SimplifiedStoreVolume } from './simplified-store-volume';
import { SimplifiedStoreStatus } from './simplified-store-status';

export class Store extends AuditingEntity implements Mappable {

  storeName: string;
  storeType: string;
  dateOpened: Date;
  dateClosed: Date;
  storeNumber: string;
  legacyLocationId: number;

  currentStoreStatus: SimplifiedStoreStatus;
  site: SimplifiedSite;
  banner: SimplifiedBanner;

  storeCasings: SimplifiedStoreCasing[];
  models: SimplifiedStoreModel[];
  volumes: SimplifiedStoreVolume[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.site != null) {
      this.site = new SimplifiedSite(obj.site);
    }
    if (obj.banner != null) {
      this.banner = new SimplifiedBanner(obj.banner);
    }
    if (obj.currentStoreStatus != null) {
      this.currentStoreStatus = new SimplifiedStoreStatus(obj.currentStoreStatus);
    }
    if (obj.shoppingCenterCasings != null) {
      this.storeCasings = obj.shoppingCenterCasings.map(casing => new SimplifiedStoreCasing(casing));
    }
    if (obj.models != null) {
      this.models = obj.models.map(model => new SimplifiedStoreModel(model));
    }
    if (obj.volumes != null) {
      this.volumes = obj.volumes.map(volume => new SimplifiedStoreVolume(volume));
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
