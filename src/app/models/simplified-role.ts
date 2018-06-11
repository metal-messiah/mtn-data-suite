import { Entity } from './entity';

export class SimplifiedRole implements Entity {

  id: number;
  displayName: string;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
