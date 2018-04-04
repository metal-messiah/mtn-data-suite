import { AuditingEntity } from './auditing-entity';
import { ShoppingCenterSurvey } from './shopping-center-survey';

export class ShoppingCenterTenant extends AuditingEntity {
  id: number;
  survey: ShoppingCenterSurvey;
  name: string;
  isAnchor = false;
  isOutparcel = false;
  tenantSqft: number;
  legacyCasingId: number;
}
