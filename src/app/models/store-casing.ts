import { AuditingEntity } from './auditing-entity';
import { StoreVolume } from './store-volume';
import { SimplifiedInteraction } from './simplified-interaction';
import { SimplifiedStoreStatus } from './simplified-store-status';

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
  interactions: SimplifiedInteraction[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.storeStatus != null) {
      this.storeStatus = new SimplifiedStoreStatus(obj.storeStatus);
    }
    if (obj.storeVolume != null) {
      this.storeVolume = new StoreVolume(obj.storeVolume);
    }
    if (obj.interactions != null) {
      this.interactions = obj.interactions.map(interaction => new SimplifiedInteraction(interaction));
    }
  }
}
