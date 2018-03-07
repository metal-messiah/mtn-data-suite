import {AuditingEntity} from './auditing-entity';

export class Banner extends AuditingEntity {
  id: number;
  bannerName: string;
  isHistorical: boolean;
  defaultStoreFit: string;
  defaultSalesArea: number;
}
