import { Entity } from './entity';

export class StoreMarker implements Entity {

  id: number;
  storeName: string;
  floating: boolean;
  storeType: string;
  validatedDate: Date;
  logoFileName: string;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
