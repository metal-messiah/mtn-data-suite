import { Entity } from './entity';

export class SimplifiedShoppingCenterTenant implements Entity {

  id: number;
  name: string;
  outparcel: boolean;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
