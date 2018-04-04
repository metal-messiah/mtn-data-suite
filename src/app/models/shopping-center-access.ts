import { AuditingEntity } from './auditing-entity';
import { ShoppingCenterSurvey } from './shopping-center-survey';

export class ShoppingCenterAccess extends AuditingEntity {
  id: number;
  survey: ShoppingCenterSurvey;
  accessType: string;
  hasLeftIn = false;
  hasOneWayRoad = false;
  hasLeftOut = false;
  hasTrafficLight = false;
  hasRightIn = false;
  hasRightOut = false;
  legacyCasingId: number;
}
