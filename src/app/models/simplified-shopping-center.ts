import { Entity } from './entity';

export class SimplifiedShoppingCenter implements Entity {

  id: number;
  name: string;
  owner: string;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
