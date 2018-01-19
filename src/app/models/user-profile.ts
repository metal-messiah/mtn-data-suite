import {Role} from './role';
import {Group} from './group';
import {AuditingEntity} from './auditing-entity';

export class UserProfile extends AuditingEntity {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  group: Group;
}
