import { AuditingEntity } from '../auditing-entity';
import { SimplifiedStoreCasing } from '../simplified/simplified-store-casing';
import { SimplifiedBanner } from '../simplified/simplified-banner';
import { SimplifiedSite } from '../simplified/simplified-site';
import { SimplifiedStoreModel } from '../simplified/simplified-store-model';
import { SimplifiedStoreVolume } from '../simplified/simplified-store-volume';
import { SimplifiedStoreStatus } from '../simplified/simplified-store-status';
import { SimplifiedStoreSurvey } from '../simplified/simplified-store-survey';
import { SimplifiedUserProfile } from '../simplified/simplified-user-profile';
import { DateUtil } from '../../utils/date-util';
import { SimplifiedStoreList } from '../simplified/simplified-store-list';

export class Store extends AuditingEntity {
  storeName: string;
  storeNumber: string;
  storeType: string;
  dateOpened: Date;
  dateClosed: Date;
  fit: string;
  format: string;
  areaSales: number;
  areaSalesPercentOfTotal: number;
  areaTotal: number;
  areaIsEstimate: boolean;
  storeIsOpen24: boolean;
  naturalFoodsAreIntegrated: boolean;
  floating: boolean;
  legacyLocationId: number;
  validatedDate: Date;
  validatedBy: SimplifiedUserProfile;

  banner: SimplifiedBanner;

  currentStoreStatus: SimplifiedStoreStatus;

  currentStoreSurvey: SimplifiedStoreSurvey;
  site: SimplifiedSite;
  storeCasings: SimplifiedStoreCasing[];
  models: SimplifiedStoreModel[];
  storeVolumes: SimplifiedStoreVolume[];
  storeStatuses: SimplifiedStoreStatus[];

  storeLists: SimplifiedStoreList[];

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
        .map((casing) => new SimplifiedStoreCasing(casing))
        .sort((a: SimplifiedStoreCasing, b: SimplifiedStoreCasing) => {
          return new Date(b.casingDate).getTime() - new Date(a.casingDate).getTime();
        });
    }
    if (obj.models != null) {
      this.models = obj.models
        .map((model) => new SimplifiedStoreModel(model))
        .sort((a: SimplifiedStoreModel, b: SimplifiedStoreModel) => {
          return b.modelDate.getTime() - a.modelDate.getTime();
        });
    }
    if (obj.storeVolumes != null) {
      this.storeVolumes = obj.storeVolumes
        .map((volume) => new SimplifiedStoreVolume(volume))
        .sort((a: SimplifiedStoreVolume, b: SimplifiedStoreVolume) => {
          return b.volumeDate.getTime() - a.volumeDate.getTime();
        });
    }
    if (obj.storeStatuses != null) {
      this.storeStatuses = obj.storeStatuses
        .map((status) => new SimplifiedStoreStatus(status))
        .sort((a: SimplifiedStoreStatus, b: SimplifiedStoreStatus) => {
          return b.statusStartDate.getTime() - a.statusStartDate.getTime();
        });
    }
    if (obj.storeLists != null) {
      this.storeLists = obj.storeLists.map((status) => new SimplifiedStoreList(status));
    }
    if (obj.validatedBy) {
      this.validatedBy = new SimplifiedUserProfile(obj.validatedBy);
    }
    if (obj.validatedDate) {
      this.validatedDate = DateUtil.getDate(obj.validatedDate);
    }
  }
}
