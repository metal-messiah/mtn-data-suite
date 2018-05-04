import { AuditingEntity } from './auditing-entity';
import { SimplifiedShoppingCenterCasing } from './simplified-shopping-center-casing';
import { SimplifiedSite } from './simplified-site';

export class ShoppingCenter extends AuditingEntity {

  name: string;
  owner: string;
  legacyLocationId: number;

  shoppingCenterCasings: SimplifiedShoppingCenterCasing[];
  sites: SimplifiedSite[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.shoppingCenterCasings) {
      this.shoppingCenterCasings = obj.shoppingCenterCasings
        .map(casing => new SimplifiedShoppingCenterCasing(casing))
        .sort((a: SimplifiedShoppingCenterCasing, b: SimplifiedShoppingCenterCasing) => {
          return new Date(b.casingDate).getTime() - new Date(a.casingDate).getTime();
        });
    }
    if (obj.sites) {
      this.sites = obj.sites.map(site => new SimplifiedSite(site));
    }
  }
}
