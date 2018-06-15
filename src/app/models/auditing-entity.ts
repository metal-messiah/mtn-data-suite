import { Entity } from './entity';
import { SimplifiedUserProfile } from './simplified/simplified-user-profile';
import { DateUtil } from '../utils/date-util';

export class AuditingEntity implements Entity {

  readonly id: number;
  createdBy: SimplifiedUserProfile;
  createdDate: Date;
  updatedBy: SimplifiedUserProfile;
  updatedDate: Date;
  version: number;

  constructor(obj) {
    this.id = obj.id;
    this.version = obj.version;
    if (obj.createdBy != null) {
      this.createdBy = new SimplifiedUserProfile(obj.createdBy);
    }
    if (obj.createdDate != null) {
      this.createdDate = DateUtil.getDate(obj.createdDate);
    }
    if (obj.updatedBy != null) {
      this.updatedBy = new SimplifiedUserProfile(obj.updatedBy);
    }
    if (obj.updatedDate != null) {
      this.updatedDate = DateUtil.getDate(obj.updatedDate);

    }
  }
}
