import { AuditingEntity } from './auditing-entity';
import { Mappable } from '../interfaces/mappable';
import { Coordinates } from './coordinates';
import { SimplifiedStoreCasing } from './simplified-store-casing';
import { SimplifiedBanner } from './simplified-banner';
import { SimplifiedSite } from './simplified-site';
import { SimplifiedStoreModel } from './simplified-store-model';
import { SimplifiedStoreVolume } from './simplified-store-volume';
import { SimplifiedStoreStatus } from './simplified-store-status';
import { SimplifiedStoreSurvey } from './simplified-store-survey';

export class Store extends AuditingEntity implements Mappable {

  storeName: string;
  storeNumber: string;
  storeType: string;
  dateOpened: Date;
  dateClosed: Date;
  legacyLocationId: number;

  currentStoreStatus: SimplifiedStoreStatus;
  currentStoreSurvey: SimplifiedStoreSurvey;
  site: SimplifiedSite;
  banner: SimplifiedBanner;

  storeCasings: SimplifiedStoreCasing[];
  models: SimplifiedStoreModel[];
  storeVolumes: SimplifiedStoreVolume[];
  storeStatuses: SimplifiedStoreStatus[];

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
    if (obj.currentStoreSurvey != null) {
      this.currentStoreSurvey = new SimplifiedStoreSurvey(obj.currentStoreSurvey);
    }
    if (obj.storeCasings != null) {
      this.storeCasings = obj.storeCasings
        .map(casing => new SimplifiedStoreCasing(casing))
        .sort((a: SimplifiedStoreCasing, b: SimplifiedStoreCasing) => {
          return new Date(b.casingDate).getTime() - new Date(a.casingDate).getTime();
        });
    }
    if (obj.models != null) {
      this.models = obj.models.map(model => new SimplifiedStoreModel(model));
    }
    if (obj.storeVolumes != null) {
      this.storeVolumes = obj.storeVolumes.map(volume => new SimplifiedStoreVolume(volume));
    }
    if (obj.storeStatuses != null) {
      this.storeStatuses = obj.storeStatuses.map(status => new SimplifiedStoreStatus(status));
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
