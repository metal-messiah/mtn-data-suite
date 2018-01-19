import {UserProfile} from './user-profile';
import {AuditingEntity} from './auditing-entity';

export class Group extends AuditingEntity {
  id: number;
  displayName: string;
  description: string;

  members: UserProfile;
}
