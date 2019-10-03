import { AuditingEntity } from '../auditing-entity';
import { SimplifiedRole } from '../simplified/simplified-role';
import { SimplifiedUserProfile } from '../simplified/simplified-user-profile';

export class Permission extends AuditingEntity {

  systemName: string;
  displayName: string;
  description: string;
  subject: string;
  action: string;

  roles: SimplifiedRole[];
  users: SimplifiedUserProfile[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.roles != null) {
      this.roles = obj.roles.map(role => new SimplifiedRole(role));
    }
    if (obj.users) {
      this.users = obj.users.map(user => new SimplifiedUserProfile(user));
    }
  }
}
