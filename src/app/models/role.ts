import { Permission } from './permission';
import { AuditingEntity } from './auditing-entity';
import { SimplifiedUserProfile } from './simplified-user-profile';

export class Role extends AuditingEntity {

  displayName: string;
  description: string;

  members: SimplifiedUserProfile[] = [];

  permissions: Permission[] = [];

  constructor(obj?) {
    super(obj);
    if (obj != null) {
      Object.assign(this, obj);
      if (obj.permissions) {
        this.permissions = obj.permissions.map(permission => new Permission(permission));
      }
    }
  }
}
