import {AuditingEntity} from './auditing-entity';
import { Project } from './project';
import { ShoppingCenter } from './shopping-center';
import { Store } from './store';
import { ShoppingCenterSurvey } from './shopping-center-survey';
import { ShoppingCenterCasing } from './shopping-center-casing';
import { StoreSurvey } from './store-survey';
import { StoreCasing } from './store-casing';

export class Interaction extends AuditingEntity {
  id: number;
  project: Project;
  shoppingCenter: ShoppingCenter;
  shoppingCenterSurvey: ShoppingCenterSurvey;
  shoppingCenterCasing: ShoppingCenterCasing;
  store: Store;
  storeSurvey: StoreSurvey;
  storeCasing: StoreCasing;
  interactionDate: Date;
  legacyCasingId: number;
}
