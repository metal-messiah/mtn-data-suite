import { Entity } from '../entity';
import { SimplifiedUserProfile } from './simplified-user-profile';

export class SimplifiedSite implements Entity {

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
  duplicate: boolean;
  assignee: SimplifiedUserProfile;
  shoppingCenterId: number;

  constructor(obj) {
    Object.assign(this, obj);
    if (obj.assignee != null) {
      this.assignee = new SimplifiedUserProfile(obj.assignee);
    }
  }
}
