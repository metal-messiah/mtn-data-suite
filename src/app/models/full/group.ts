import { AuditingEntity } from '../auditing-entity';
import { SimplifiedUserProfile } from '../simplified/simplified-user-profile';

export class Group extends AuditingEntity {

  displayName: string;
  description: string;

  members: SimplifiedUserProfile[] = [];

  constructor(obj) {
    super(obj);
    if (obj != null) {
      Object.assign(this, obj);
    }
  }
}
