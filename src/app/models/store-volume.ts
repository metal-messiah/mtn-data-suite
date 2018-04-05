import { AuditingEntity } from './auditing-entity';

export class StoreVolume extends AuditingEntity {
  id: number;
  volumeTotal: number;
  volumeDate: Date;
  volumeType: string;
  source: string;
  legacyCasingId: number;
}
