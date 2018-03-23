import { AuditingEntity } from './auditing-entity';
import { Store } from './store';
import { Interaction } from './interaction';

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
  volumeTotal: number;
  volumeConfidence: string;
  legacyCasingId: number;

  interactions: Interaction[];
}
