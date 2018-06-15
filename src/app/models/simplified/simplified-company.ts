import { Entity } from '../entity';

export class SimplifiedCompany implements Entity {

  id: number;
  companyName: string;
  websiteUrl: string;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
