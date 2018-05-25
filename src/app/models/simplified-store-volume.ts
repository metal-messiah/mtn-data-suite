import { Entity } from './entity';

export class SimplifiedStoreVolume implements Entity {

  id: number;
  volumeTotal: number;
  volumeDate: Date;
  volumeType: string;
  source: string;

  constructor(obj) {
    Object.assign(this, obj);
    this.volumeDate = new Date(this.volumeDate);
  }

}

