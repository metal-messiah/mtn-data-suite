import { AuditingEntity } from '../auditing-entity';
import { SimplifiedShoppingCenterTenant } from '../simplified/simplified-shopping-center-tenant';
import { SimplifiedShoppingCenterCasing } from '../simplified/simplified-shopping-center-casing';
import { ShoppingCenterAccess } from './shopping-center-access';
import { DateUtil } from '../../utils/date-util';

export class ShoppingCenterSurvey extends AuditingEntity {

  surveyDate: Date;
  centerType: string;
  note: string;
  flowHasLandscaping: boolean;
  flowHasSpeedBumps: boolean;
  flowHasStopSigns: boolean;
  flowHasOneWayAisles: boolean;
  parkingHasAngledSpaces: boolean;
  parkingHasParkingHog: boolean;
  parkingIsPoorlyLit: boolean;
  parkingSpaceCount: number;
  tenantOccupiedCount: number;
  tenantVacantCount: number;
  sqFtPercentOccupied: number;
  legacyCasingId;

  accesses: ShoppingCenterAccess[];
  tenants: SimplifiedShoppingCenterTenant[];
  shoppingCenterCasings: SimplifiedShoppingCenterCasing[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);

    if (obj.surveyDate != null) {
      this.surveyDate = DateUtil.getDate(obj.surveyDate);
    }
    if (obj.accesses != null) {
      this.accesses = obj.accesses.map(access => new ShoppingCenterAccess(access));
    }
    if (obj.tenants != null) {
      this.tenants = obj.tenants.map(tenant => new SimplifiedShoppingCenterTenant(tenant))
        .sort((a: SimplifiedShoppingCenterTenant, b: SimplifiedShoppingCenterTenant) => {
          return a.name.localeCompare(b.name);
        });
    }
    if (obj.shoppingCenterCasings != null) {
      this.shoppingCenterCasings = obj.shoppingCenterCasings.map(shoppingCenterCasing => {
        new SimplifiedShoppingCenterCasing(shoppingCenterCasing);
      });
    }
  }
}
