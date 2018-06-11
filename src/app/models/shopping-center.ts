import { AuditingEntity } from './auditing-entity';
import { SimplifiedShoppingCenterCasing } from './simplified-shopping-center-casing';
import { SimplifiedShoppingCenterSurvey } from './simplified-shopping-center-survey';
import { SimplifiedInteraction } from './simplified-interaction';
import { SimplifiedSite } from './simplified-site';

export class ShoppingCenter extends AuditingEntity {

  name: string;
  owner: string;
  legacyLocationId: number;

  casings: SimplifiedShoppingCenterCasing[];
  surveys: SimplifiedShoppingCenterSurvey[];
  interactions: SimplifiedInteraction[];
  sites: SimplifiedSite[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.casings) {
      this.casings = obj.casings.map(casing => new SimplifiedShoppingCenterCasing(casing));
    }
    if (obj.surveys) {
      this.surveys = obj.surveys.map(survey => new SimplifiedShoppingCenterSurvey(survey));
    }
    if (obj.interactions) {
      this.interactions = obj.interactions.map(interaction => new SimplifiedInteraction(interaction));
    }
    if (obj.sites) {
      this.sites = obj.sites.map(site => new SimplifiedSite(site));
    }
  }
}
