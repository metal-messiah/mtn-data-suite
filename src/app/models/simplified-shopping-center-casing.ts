import { Entity } from './entity';

export class SimplifiedShoppingCenterCasing implements Entity {

  id: number;
  casingDate: Date;
  note: string;

  constructor(obj?) {
    Object.assign(this, obj);
  }
}
