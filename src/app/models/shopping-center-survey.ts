import { AuditingEntity } from './auditing-entity';
import { SimplifiedShoppingCenterAccess } from './simplified-shopping-center-access';
import { SimplifiedShoppingCenterTenant } from './simplified-shopping-center-tenant';
import { SimplifiedShoppingCenterCasing } from './simplified-shopping-center-casing';
import { ShoppingCenterAccess } from './shopping-center-access';
import { ShoppingCenterTenant } from './shopping-center-tenant';

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
  tenants: ShoppingCenterTenant[];
  shoppingCenterCasings: SimplifiedShoppingCenterCasing[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.accesses != null) {
      this.accesses = obj.accesses.map(access => new ShoppingCenterAccess(access));
    }
    if (obj.tenants != null) {
      this.tenants = obj.tenants.map(tenant => new ShoppingCenterTenant(tenant))
        .sort((a: ShoppingCenterTenant, b: ShoppingCenterTenant) => {
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
