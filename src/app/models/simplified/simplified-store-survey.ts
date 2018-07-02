import { Entity } from '../entity';
import { DateUtil } from '../../utils/date-util';

export class SimplifiedStoreSurvey implements Entity {

  id: number;
  surveyDate: Date;
  note: string;
  fit: string;
  areaSales: number;
  areaTotal: number;

  constructor(obj) {
    Object.assign(this, obj);

    if (obj.surveyDate != null) {
      this.surveyDate = DateUtil.getDate(obj.surveyDate);
    }
  }

}
