import { AuditingEntity } from './auditing-entity';

export class SimplifiedPermission extends AuditingEntity {

  systemName: string;
  displayName: string;
  description: string;
  subject: string;
  action: string;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
  }
}
