import { AuditingEntity } from '../auditing-entity';
import { Mappable } from '../../interfaces/mappable';
import { Coordinates } from '../coordinates';
import { SimplifiedStoreCasing } from '../simplified/simplified-store-casing';
import { SimplifiedBanner } from '../simplified/simplified-banner';
import { SimplifiedSite } from '../simplified/simplified-site';
import { SimplifiedStoreModel } from '../simplified/simplified-store-model';
import { SimplifiedStoreVolume } from '../simplified/simplified-store-volume';
import { SimplifiedStoreStatus } from '../simplified/simplified-store-status';
import { SimplifiedStoreSurvey } from '../simplified/simplified-store-survey';

export class Store extends AuditingEntity {

  storeName: string;
  storeNumber: string;
  storeType: string;
  dateOpened: Date;
  dateClosed: Date;
  legacyLocationId: number;
  floating: boolean;

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
      this.models = obj.models
        .map(model => new SimplifiedStoreModel(model))
        .sort((a: SimplifiedStoreModel, b: SimplifiedStoreModel) => {
          return b.modelDate.getTime() - a.modelDate.getTime();
      });
    }
    if (obj.storeVolumes != null) {
      this.storeVolumes = obj.storeVolumes
        .map(volume => new SimplifiedStoreVolume(volume))
        .sort((a: SimplifiedStoreVolume, b: SimplifiedStoreVolume) => {
          return b.volumeDate.getTime() - a.volumeDate.getTime();
        });
    }
    if (obj.storeStatuses != null) {
      this.storeStatuses = obj.storeStatuses
        .map(status => new SimplifiedStoreStatus(status))
        .sort((a: SimplifiedStoreStatus, b: SimplifiedStoreStatus) => {
          return b.statusStartDate.getTime() - a.statusStartDate.getTime();
        });
    }
  }
}
