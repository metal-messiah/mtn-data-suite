import {AuditingEntity} from './auditing-entity';
import { SimplifiedBanner } from './simplified-banner';
import { SimplifiedCompany } from './simplified-company';

export class Company extends AuditingEntity {

  companyName: string;
  websiteUrl: string;

  parentCompany: SimplifiedCompany;

  childCompanies: SimplifiedCompany[];
  banners: SimplifiedBanner[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.parentCompany != null) {
      this.parentCompany = new SimplifiedCompany(obj.parentCompany);
    }
    if (obj.childCompanies != null) {
      this.childCompanies = obj.childCompanies.map(company => new SimplifiedCompany(company));
    }
    if (obj.banners != null) {
      this.banners = obj.banners.map(banner => new SimplifiedBanner(banner));
    }

  }
}

