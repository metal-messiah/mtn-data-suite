import { Entity } from './entity';

export class SimplifiedStoreStatus implements Entity {

  id: number;
  status: string;
  statusStartDate: Date;

  constructor(obj) {
    Object.assign(this, obj);
    if (typeof obj.statusStartDate === 'string') {
      obj.statusStartDate = obj.statusStartDate + ' GMT-0600';
    }
    this.statusStartDate = new Date(obj.statusStartDate);
  }
}
