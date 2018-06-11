import { Entity } from './entity';

export class SimplifiedStoreModel implements Entity {

  id: number;
  fitAdjustedPower: number;
  modelDate: Date;
  modelType: string;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
