import { Entity } from '../entity';

export class SimplifiedUserProfile implements Entity {

  id: number;
  email: string;

  constructor(obj) {
    Object.assign(this, obj);
  }

}
