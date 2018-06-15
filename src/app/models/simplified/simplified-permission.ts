import { Entity } from '../entity';

export class SimplifiedPermission implements Entity {

  id: number;
  systemName: string;
  displayName: string;
  description: string;
  subject: string;
  action: string;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
