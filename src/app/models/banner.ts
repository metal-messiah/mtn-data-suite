import {AuditingEntity} from './auditing-entity';

export class Banner extends AuditingEntity {

  bannerName: string;
  isHistorical: boolean;
  defaultStoreFit: string;
  defaultSalesArea: number;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
  }
}
