import { AuditingEntity } from './auditing-entity';
import { SimplifiedRole } from './simplified-role';

export class Permission extends AuditingEntity {

  systemName: string;
  displayName: string;
  description: string;
  subject: string;
  action: string;

  roles: SimplifiedRole[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.roles != null) {
      this.roles = obj.roles.map(role => new SimplifiedRole(role));
    }
  }
}
