import { AuditingEntity } from './auditing-entity';
import { Store } from './store';
import { Interaction } from './interaction';
import { StoreVolume } from './store-volume';

export class StoreCasing extends AuditingEntity {
  id: number;
  store: Store;
  casingDate: Date;
  note: string;
  status: string;
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

  storeVolume: StoreVolume;
  interactions: Interaction[];

  constructor(obj?: StoreCasing) {
    if (obj != null) {
      super(obj);
      Object.keys(obj).forEach(key => this[key] = obj[key]);
      if (obj.storeVolume != null) {
        this.storeVolume = new StoreVolume(obj.storeVolume);
      }
      if (obj.interactions != null) {
        this.interactions = obj.interactions.map(interaction => new Interaction(interaction));
      }
    }
  }
}
