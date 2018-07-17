import { Entity } from '../entity';
import { DateUtil } from '../../utils/date-util';

export class SimplifiedStoreVolume implements Entity {

  id: number;
  volumeTotal: number;
  volumeDate: Date;
  volumeType: string;

  constructor(obj) {
    Object.assign(this, obj);
    if (obj.volumeDate != null) {
      this.volumeDate = DateUtil.getDate(obj.volumeDate);
    }
  }

}

