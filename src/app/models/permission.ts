import { AuditingEntity } from './auditing-entity';

export class Permission extends AuditingEntity{

  systemName: string;
  displayName: string;
  description: string;
  subject: string;
  action: string;
  selected: boolean;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
  }
}
