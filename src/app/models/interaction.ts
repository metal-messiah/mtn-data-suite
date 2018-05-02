import { AuditingEntity } from './auditing-entity';
import { SimplifiedProject } from './simplified-project';
import { SimplifiedStore } from './simplified-store';
import { SimplifiedStoreCasing } from './simplified-store-casing';
import { SimplifiedShoppingCenterCasing } from './simplified-shopping-center-casing';
import { SimplifiedShoppingCenterSurvey } from './simplified-shopping-center-survey';
import { SimplifiedShoppingCenter } from './simplified-shopping-center';
import { SimplifiedStoreSurvey } from './simplified-store-survey';
import { SimplifiedSite } from './simplified-site';

export class Interaction extends AuditingEntity {

  project: SimplifiedProject;
  shoppingCenter: SimplifiedShoppingCenter;
  shoppingCenterSurvey: SimplifiedShoppingCenterSurvey;
  shoppingCenterCasing: SimplifiedShoppingCenterCasing;
  store: SimplifiedStore;
  site: SimplifiedSite;
  storeSurvey: SimplifiedStoreSurvey;
  storeCasing: SimplifiedStoreCasing;
  interactionDate: Date;
  legacyCasingId: number;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.project != null) {
      this.project = new SimplifiedProject(obj.project);
    }
    if (obj.shoppingCenter != null) {
      this.shoppingCenter = new SimplifiedShoppingCenter(obj.shoppingCenter);
    }
    if (obj.shoppingCenterSurvey != null) {
      this.shoppingCenterSurvey = new SimplifiedShoppingCenterSurvey(obj.shoppingCenterSurvey);
    }
    if (obj.shoppingCenterCasing != null) {
      this.shoppingCenterCasing = new SimplifiedShoppingCenterCasing(obj.shoppingCenterCasing);
    }
    if (obj.store != null) {
      this.store = new SimplifiedStore(obj.store);
    }
    if (obj.site != null) {
      this.site = new SimplifiedSite(obj.site);
    }
    if (obj.storeSurvey != null) {
      this.storeSurvey = new SimplifiedStoreSurvey(obj.storeSurvey);
    }
    if (obj.storeCasing != null) {
      this.storeCasing = new SimplifiedStoreCasing(obj.storeCasing);
    }
  }
}
