import { Entity } from './entity';
import { DateUtil } from '../utils/date-util';

export class StoreMarker implements Entity {

  id: number;
  storeName: string;
  float: boolean;
  storeType: string;
  validatedDate: Date;
  createdDate: Date;
  logoFileName: string;
  bannerId: number;
  status: string;
  statusStartDate: Date;

  constructor(obj) {
    Object.assign(this, obj);

    if (obj.validatedDate) {
      this.validatedDate = DateUtil.getDate(obj.validatedDate);
    }
    if (obj.createdDate) {
      this.createdDate = DateUtil.getDate(obj.createdDate);
    }
    if (obj.statusStartDate) {
      this.statusStartDate = DateUtil.getDate(obj.statusStartDate);
    }
  }
}
