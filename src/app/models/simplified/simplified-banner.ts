import { Entity } from '../entity';

export class SimplifiedBanner implements Entity {

  id: number;
  bannerName: string;
  logoFileName: string;
  companyName: string;
  parentCompanyName: string;

  constructor(obj) {
    Object.assign(this, obj);
  }

}
