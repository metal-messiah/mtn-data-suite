import { Entity } from './entity';

export class SimplifiedStoreStatus implements Entity {

  id: number;
  status: string;
  statusStartDate: Date;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
