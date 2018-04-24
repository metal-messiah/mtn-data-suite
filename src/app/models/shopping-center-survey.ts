import { AuditingEntity } from './auditing-entity';
import { ShoppingCenterTenant } from './shopping-center-tenant';
import { SimplifiedInteraction } from './simplified-interaction';
import { SimplifiedShoppingCenterAccess } from './simplified-shopping-center-access';
import { SimplifiedShoppingCenterTenant } from './simplified-shopping-center-tenant';

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

  accesses: SimplifiedShoppingCenterAccess[];
  tenants: SimplifiedShoppingCenterTenant[];
  interactions: SimplifiedInteraction[];

  constructor(obj?) {
    super(obj);
    Object.assign(this, obj);
    if (obj.accesses != null) {
      this.accesses = obj.accesses.map(access => new SimplifiedShoppingCenterAccess(access));
    }
    if (obj.tenants != null) {
      this.tenants = obj.tenants.map(tenant => new SimplifiedShoppingCenterTenant(tenant));
    }
    if (obj.interactions != null) {
      this.interactions = obj.interactions.map(interaction => new SimplifiedInteraction(interaction));
    }
  }
}
