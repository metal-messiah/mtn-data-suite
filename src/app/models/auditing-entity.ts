import {UserProfile} from './user-profile';

export class AuditingEntity {
  createdBy: UserProfile;
  createdDate: Date;
  updatedBy: UserProfile;
  updatedDate: Date;
  version: number;
}
