import { AuditingEntity } from '../auditing-entity';
import { ShoppingCenter } from './shopping-center';
import { Store } from './store';
import { SimplifiedUserProfile } from '../simplified/simplified-user-profile';

export class Site extends AuditingEntity {

  latitude: number;
  longitude: number;
  type: string;
  positionInCenter: string;
  address1: string;
  address2: string;
  city: string;
  county: string;
  state: string;
  postalCode: string;
  country: string;
  intersectionType: string;
  quad: string;
  intersectionStreetPrimary: string;
  intersectionStreetSecondary: string;
  duplicate: boolean;
  backfilledNonGrocery: boolean;

  shoppingCenter: ShoppingCenter;
  stores: Store[];
  assignee: SimplifiedUserProfile;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.shoppingCenter != null) {
      this.shoppingCenter = new ShoppingCenter(obj.shoppingCenter);
    }
    if (obj.stores != null) {
      this.stores = obj.stores.map(store => new Store(store));
    } else {
      this.stores = [];
    }
    if (obj.assignee != null) {
      this.assignee = new SimplifiedUserProfile(obj.assignee);
    }
  }
}
