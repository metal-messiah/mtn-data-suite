import {UserProfile} from './user-profile';
import { Entity } from './entity';

export class AuditingEntity extends Entity {
  createdBy: UserProfile;
  createdDate: Date;
  updatedBy: UserProfile;
  updatedDate: Date;
  version: number;

  constructor(obj?) {
    super(obj);
    Object.assign(this, obj);
  }
}
