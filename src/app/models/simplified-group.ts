import { Entity } from './entity';

export class SimplifiedGroup implements Entity {

  id: number;
  displayName: string;

  constructor(obj) {
     Object.assign(this, obj);
  }
}
