import {AuditingEntity} from './auditing-entity';
import { Project } from './project';
import { ShoppingCenter } from './shopping-center';
import { Store } from './store';
import { Interaction } from './interaction';
import { ShoppingCenterAccess } from './shopping-center-access';
import { ShoppingCenterTenant } from './shopping-center-tenant';

export class ShoppingCenterSurvey extends AuditingEntity {
  id: number;
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

  shoppingCenter: ShoppingCenter;

  interactions: Interaction[];
  accesses: ShoppingCenterAccess[];
  tenants: ShoppingCenterTenant[];
}
