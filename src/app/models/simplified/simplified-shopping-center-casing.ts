import { Entity } from '../entity';
import { DateUtil } from '../../utils/date-util';

export class SimplifiedShoppingCenterCasing implements Entity {

  id: number;
  casingDate: Date;
  note: string;

  constructor(obj) {
    Object.assign(this, obj);

    if (obj.casingDate != null) {
      this.casingDate = DateUtil.getDate(obj.casingDate);
    }
  }
}
