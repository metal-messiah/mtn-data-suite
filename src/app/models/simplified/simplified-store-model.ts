import { Entity } from '../entity';
import { DateUtil } from '../../utils/date-util';

export class SimplifiedStoreModel implements Entity {

  id: number;
  fitAdjustedPower: number;
  modelDate: Date;
  modelType: string;

  constructor(obj) {
    Object.assign(this, obj);
    this.modelDate = DateUtil.getDate(obj.modelType);
  }
}
