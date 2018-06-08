import { AuditingEntity } from './auditing-entity';
import { StoreVolume } from './store-volume';
import { SimplifiedStoreStatus } from './simplified-store-status';
import { SimplifiedProject } from './simplified-project';
import { StoreSurvey } from './store-survey';
import { DateUtil } from '../utils/date-util';
import { ShoppingCenterCasing } from './shopping-center-casing';

export class StoreCasing extends AuditingEntity {

  casingDate: Date;
  note: string;
  conditionCeiling: string;
  conditionCheckstands: string;
  conditionFloors: string;
  conditionFrozenRefrigerated: string;
  conditionShelvingGondolas: string;
  conditionWalls: string;
  fuelGallonsWeekly: number;
  pharmacyScriptsWeekly: number;
  pharmacyAvgDollarsPerScript: number;
  pharmacyPharmacistCount: number;
  pharmacyTechnicianCount: number;
  legacyCasingId: number;

  storeStatus: SimplifiedStoreStatus;
  storeVolume: StoreVolume;
  storeSurvey: StoreSurvey;
  shoppingCenterCasing: ShoppingCenterCasing;
  projects: SimplifiedProject[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);

    if (obj.casingDate != null) {
      this.casingDate = DateUtil.getDate(obj.casingDate);
    }
    if (obj.storeStatus != null) {
      this.storeStatus = new SimplifiedStoreStatus(obj.storeStatus);
    }
    if (obj.storeVolume != null) {
      this.storeVolume = new StoreVolume(obj.storeVolume);
    }
    if (obj.storeSurvey != null) {
      this.storeSurvey = new StoreSurvey(obj.storeSurvey);
    }
    if (obj.projects != null) {
      this.projects = obj.projects.map(project => new SimplifiedProject(project));
    }
    if (obj.shoppingCenterCasing != null) {
      this.shoppingCenterCasing = new ShoppingCenterCasing(obj.shoppingCenterCasing);
    }
  }
}
