import { AuditingEntity } from './auditing-entity';
import { StoreVolume } from './store-volume';
import { SimplifiedStoreStatus } from './simplified-store-status';
import { StoreSurvey } from './store-survey';
import { SimplifiedStoreSurvey } from './simplified-store-survey';
import { SimplifiedProject } from './simplified-project';

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
  volumeGrocery: number;
  volumePercentGrocery: number;
  volumeMeat: number;
  volumePercentMeat: number;
  volumeNonFood: number;
  volumePercentNonFood: number;
  volumeOther: number;
  volumePercentOther: number;
  volumeProduce: number;
  volumePercentProduce: number;
  volumePlusMinus: number;
  volumeNote: string;
  volumeConfidence: string;
  legacyCasingId: number;

  storeStatus: SimplifiedStoreStatus;
  storeVolume: StoreVolume;
  storeSurvey: SimplifiedStoreSurvey;
  projects: SimplifiedProject[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.storeStatus != null) {
      this.storeStatus = new SimplifiedStoreStatus(obj.storeStatus);
    }
    if (obj.storeVolume != null) {
      this.storeVolume = new StoreVolume(obj.storeVolume);
    }
    if (obj.storeSurvey != null) {
      this.storeSurvey = new SimplifiedStoreSurvey(obj.storeSurvey);
    }
    if (obj.projects != null) {
      this.projects = obj.projects.map(project => new SimplifiedProject(project));
    }
  }
}
