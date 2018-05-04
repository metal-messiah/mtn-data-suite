import { AuditingEntity } from './auditing-entity';
import { Mappable } from '../interfaces/mappable';
import { Coordinates } from './coordinates';
import { ShoppingCenter } from './shopping-center';
import { Store } from './store';

export class Site extends AuditingEntity implements Mappable {

  latitude: number;
  longitude: number;
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
  duplicate: boolean;

  shoppingCenter: ShoppingCenter;
  stores: Store[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.shoppingCenter != null) {
      this.shoppingCenter = new ShoppingCenter(obj.shoppingCenter);
    }
    if (obj.stores != null) {
      this.stores = obj.stores.map(store => new Store(store));
    }
  }

  getCoordinates(): Coordinates {
    return {lat: this.latitude, lng: this.longitude};
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

}
