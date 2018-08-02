import { Entity } from '../entity';

export class SimplifiedShoppingCenter implements Entity {

  id: number;
  name: string;
  owner: string;
  centerType: string;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
