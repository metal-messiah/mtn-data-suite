import {UserProfile} from './user-profile';

export class AuditingEntity {
  createdBy: UserProfile;
  createdDate: Date;
  updatedBy: UserProfile;
  updatedDate: Date;
  version: number;

  constructor(obj?: AuditingEntity) {
    if (obj) {
      Object.keys(obj).forEach(key => this[key] = obj[key]);
    }
  }
}
