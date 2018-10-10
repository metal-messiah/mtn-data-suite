import { AuditingEntity } from '../auditing-entity';
import { Company } from './company';

export class Banner extends AuditingEntity {

  bannerName: string;
  isHistorical: boolean;
  defaultStoreFit: string;
  defaultSalesArea: number;
  logoFileName: string;

  company: Company;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
  }
}
