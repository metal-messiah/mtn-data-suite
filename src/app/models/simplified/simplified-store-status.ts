import { Entity } from '../entity';
import { DateUtil } from '../../utils/date-util';

export class SimplifiedStoreStatus implements Entity {

  id: number;
  status: string;
  statusStartDate: Date;

  constructor(obj) {
    Object.assign(this, obj);

    if (obj.statusStartDate != null) {
      this.statusStartDate = DateUtil.getDate(obj.statusStartDate);
    }
  }
}
