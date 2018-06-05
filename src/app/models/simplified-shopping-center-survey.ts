import { Entity } from './entity';
import { DateUtil } from '../utils/date-util';

export class SimplifiedShoppingCenterSurvey implements Entity {

  id: number;
  surveyDate: Date;
  centerType: string;
  note: string;

  constructor(obj) {
    Object.assign(this, obj);

    if (obj.surveyDate != null) {
      this.surveyDate = DateUtil.getDate(obj.surveyDate);
    }
  }
}
