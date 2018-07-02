import { AuditingEntity } from '../auditing-entity';
import { SimplifiedUserProfile } from '../simplified/simplified-user-profile';
import { SimplifiedPermission } from '../simplified/simplified-permission';

export class Role extends AuditingEntity {

  displayName: string;
  description: string;

  permissions: SimplifiedPermission[] = [];
  members: SimplifiedUserProfile[] = [];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.permissions != null) {
      this.permissions = obj.permissions.map(permission => new SimplifiedPermission(permission));
    }
    if (obj.members != null) {
      this.members = obj.members.map(member => new SimplifiedUserProfile(member));
    }
  }
}
