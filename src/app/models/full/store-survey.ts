import { AuditingEntity } from '../auditing-entity';
import { SimplifiedStoreCasing } from '../simplified/simplified-store-casing';
import { DateUtil } from '../../utils/date-util';

export class StoreSurvey extends AuditingEntity {

  surveyDate: Date;
  note: string;
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
  accessibilityMultipleRetailersBeforeSite: boolean;
  accessibilitySetBackTwiceParkingLength: boolean;
  accessibilityRating: string;
  parkingOutparcelsInterfereWithParking: boolean;
  parkingDirectAccessToParking: boolean;
  parkingSmallParkingField: boolean;
  parkingHasTSpaces: boolean;
  parkingHasAngledSpaces: boolean;
  parkingHasParkingHog: boolean;
  parkingIsPoorlyLit: boolean;
  parkingRating: string;
  parkingSpaceCount: number;
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
  seasonalityNotes: string;

  storeCasings: SimplifiedStoreCasing[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);

    if (obj.surveyDate != null) {
      this.surveyDate = DateUtil.getDate(obj.surveyDate);
    }
    if (obj.storeCasings != null) {
      this.storeCasings = obj.storeCasings.map(storeCasing => new SimplifiedStoreCasing(storeCasing));
    }
  }

}
