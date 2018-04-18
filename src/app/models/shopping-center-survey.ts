import {AuditingEntity} from './auditing-entity';
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

  constructor(obj?) {
    super(obj);
    Object.assign(this, obj);
    if (obj.accesses != null) {
      this.accesses = obj.accesses.map(access => new ShoppingCenterAccess(access));
    }
    if (obj.tenants != null) {
      this.tenants = obj.tenants.map(tenant => new ShoppingCenterTenant(tenant));
    }
  }
}
