import { AuditingEntity } from './auditing-entity';
import { Interaction } from './interaction';
import { StoreVolume } from './store-volume';

export class StoreSurvey extends AuditingEntity {

  surveyDate: Date;
  note: string;
  fit: string;
  format: string;
  areaSales: number;
  areaSalesPercentOfTotal: number;
  areaTotal: number;
  areaIsEstimate: boolean;
  storeIsOpen24: boolean;
  naturalFoodsAreIntegrated: boolean;
  registerCountNormal: number;
  registerCountExpress: number;
  registerCountSelfCheckout: number;
  fuelDispenserCount: number;
  fuelIsOpen24: boolean;
  pharmacyIsOpen24: boolean;
  pharmacyHasDriveThrough: boolean;
  departmentBakery: boolean;
  departmentBank: boolean;
  departmentBeer: boolean;
  departmentBulk: boolean;
  departmentCheese: boolean;
  departmentCoffee: boolean;
  departmentDeli: boolean;
  departmentExpandedGm: boolean;
  departmentExtensivePreparedFoods: boolean;
  departmentFloral: boolean;
  departmentFuel: boolean;
  departmentHotBar: boolean;
  departmentInStoreRestaurant: boolean;
  departmentLiquor: boolean;
  departmentMeat: boolean;
  departmentNatural: boolean;
  departmentOliveBar: boolean;
  departmentOnlinePickup: boolean;
  departmentPharmacy: boolean;
  departmentPreparedFoods: boolean;
  departmentSaladBar: boolean;
  departmentSeafood: boolean;
  departmentSeating: boolean;
  departmentSushi: boolean;
  departmentWine: boolean;
  accessibilityFarthestFromEntrance: boolean;
  accessibilityMainIntersectionHasTrafficLight: boolean;
  accessibilityMainIntersectionNeedsTrafficLight: boolean;
  accessibilityMultipleRetailersBeforeSite: boolean;
  accessibilitySetBackTwiceParkingLength: boolean;
  accessibilityRating: string;
  parkingOutparcelsInterfereWithParking: boolean;
  parkingDirectAccessToParking: boolean;
  parkingSmallParkingField: boolean;
  parkingHasTSpaces: boolean;
  parkingRating: string;
  visibilityHillDepressionBlocksView: boolean;
  visibilityOutparcelsBlockView: boolean;
  visibilitySignOnMain: boolean;
  visibilityStoreFacesMainRoad: boolean;
  visibilityTreesBlockView: boolean;
  visibilityRating: string;
  seasonalityJan: number;
  seasonalityFeb: number;
  seasonalityMar: number;
  seasonalityApr: number;
  seasonalityMay: number;
  seasonalityJun: number;
  seasonalityJul: number;
  seasonalityAug: number;
  seasonalitySep: number;
  seasonalityOct: number;
  seasonalityNov: number;
  seasonalityDec: number;
  legacyCasingId: number;

  constructor(obj?) {
    super(obj);
    Object.assign(this, obj);
  }

}
