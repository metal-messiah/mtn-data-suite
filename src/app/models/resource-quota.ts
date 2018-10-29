import { AuditingEntity } from './auditing-entity';

export class ResourceQuota extends AuditingEntity {

    resourceName: string;
    periodStartDate: Date;
    queryCount: number;
    quotaLimit: number;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    
  }
}
