import { Role } from './role';
import { Group } from './group';
import { AuditingEntity } from '../auditing-entity';

export class UserProfile extends AuditingEntity {

  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  group: Group;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.role != null) {
      this.role = new Role(obj.role);
    }
    if (obj.group != null) {
      this.group = new Group(obj.group);
    }
  }
}
