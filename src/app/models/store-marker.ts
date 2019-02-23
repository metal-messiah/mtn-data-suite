import { Entity } from './entity';

export class StoreMarker implements Entity {

  id: number;
  storeName: string;
  float: boolean;
  storeType: string;
  validatedDate: Date;
  logoFileName: string;
  bannerId: number;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
