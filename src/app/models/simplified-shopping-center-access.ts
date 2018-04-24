import { Entity } from './entity';

export class SimplifiedShoppingCenterAccess implements Entity {

  id: number;
  accessType: string;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
