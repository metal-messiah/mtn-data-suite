import { AuditingEntity } from './auditing-entity';

export class StoreVolume extends AuditingEntity {

  volumeTotal: number;
  volumeDate: Date;
  volumeType: string;
  source: string;
  legacyCasingId: number;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    this.volumeDate = new Date(this.volumeDate);
  }
}
