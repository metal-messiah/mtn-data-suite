import { Mappable } from '../interfaces/mappable';
import { Coordinates } from './coordinates';
import { Entity } from './entity';

export class SimplifiedSite implements Entity, Mappable {

  id: number;
  latitude: number;
  longitude: number;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  quad: string;
  intersectionStreetPrimary: string;
  intersectionStreetSecondary: string;

  constructor(obj?) {
    Object.assign(this, obj);
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
