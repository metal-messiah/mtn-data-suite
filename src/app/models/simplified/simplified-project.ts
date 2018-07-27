import { Entity } from '../entity';

export class SimplifiedProject implements Entity {

  id: number;
  projectName: string;
  active: boolean;
  primaryData: boolean;
  hasBoundary: boolean;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
