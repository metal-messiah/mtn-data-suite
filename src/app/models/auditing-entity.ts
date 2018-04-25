import { Entity } from './entity';
import { SimplifiedUserProfile } from './simplified-user-profile';

export class AuditingEntity implements Entity {

  readonly id: number;
  readonly createdBy: SimplifiedUserProfile;
  readonly createdDate: Date;
  readonly updatedBy: SimplifiedUserProfile;
  readonly updatedDate: Date;
  readonly version: number;

  constructor(obj) {
    Object.assign(this, obj);
    if (obj.createdBy != null) {
      this.createdBy = new SimplifiedUserProfile(obj.createdBy);
    }
    if (obj.updatedBy != null) {
      this.updatedBy = new SimplifiedUserProfile(obj.updatedBy);
    }
  }
}
