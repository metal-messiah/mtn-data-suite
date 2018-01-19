import {Permission} from './permission';
import {UserProfile} from './user-profile';
import {AuditingEntity} from './auditing-entity';

export class Role extends AuditingEntity{
  id: number;
  displayName: string;
  description: string;

  members: UserProfile[] = [];
  permissions: Permission[];
}
