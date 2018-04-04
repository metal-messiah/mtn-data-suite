import { AuditingEntity } from './auditing-entity';
import { ShoppingCenter } from './shopping-center';
import { Store } from './store';
import { Mappable } from '../interfaces/mappable';

export class Site extends AuditingEntity implements Mappable {
  id: number;
  location: any;
  type: string;
  footprintSqft: number;
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

  // Only included in SimpleSiteView
  private activeStore: Store;
  hasPlannedStore: boolean;

  // Only included in SiteView
  shoppingCenter: ShoppingCenter;
  private stores: Store[];

  constructor(obj?: Site) {
    if (obj != null) {
      super(obj);
      Object.keys(obj).forEach(key => this[key] = obj[key]);
      if (obj.stores != null) {
        this.stores = obj.stores.map(store => new Store(store));
      }
      if (obj.activeStore != null) {
        this.activeStore = new Store(obj.activeStore);
      }
      if (obj.shoppingCenter != null) {
        this.shoppingCenter = new ShoppingCenter(obj.shoppingCenter);
      }
    }
  }

  getId(): number {
    return this.id;
  }

  getCoordinates(): number[] {
    return this.location.coordinates;
  }

  getLabel(): string {
    if (this.activeStore != null) {
      return this.activeStore.getLabel();
    } else if (this.hasPlannedStore) {
      return 'Planned';
    }
    return 'Unknown';
  }

  getIntersection(): string {
    let intersection = '';
    if (this.quad !== null) {
      intersection += this.quad;
      if (this.intersectionStreetPrimary !== null || this.intersectionStreetSecondary !== null) {
        intersection += ' of ';
      }
    }
    if (this.intersectionStreetPrimary !== null) {
      intersection += this.intersectionStreetPrimary;
      if (this.intersectionStreetSecondary !== null) {
        intersection += ' & ';
      }
    }
    if (this.intersectionStreetSecondary !== null) {
      intersection += this.intersectionStreetSecondary;
    }
    return intersection;
  }

  getPrincipality(): string {
    let principality = '';
    if (this.city !== null) {
      principality += this.city;
      if (this.state !== null) {
        principality += ', ';
      }
    }
    if (this.state !== null) {
      principality += this.state;
    }
    if (this.postalCode !== null) {
      if (principality.length > 0) {
        principality += ' ';
      }
      principality += this.postalCode;
    }
    return principality;
  }

  getActiveStore(): Store {
    if (this.activeStore != null) {
      return this.activeStore;
    } else if (this.stores != null && this.stores.length > 0) {
      return this.stores.find(store => store.storeType === 'ACTIVE');
    }
  }

}
