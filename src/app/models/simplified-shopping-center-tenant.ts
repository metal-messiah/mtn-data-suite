import { Entity } from './entity';

export class SimplifiedShoppingCenterTenant implements Entity {

  id: number;
  name: string;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
