import { Entity } from './entity';

export class SimplifiedShoppingCenterSurvey implements Entity {

  id: number;
  surveyDate: Date;
  centerType: string;
  note: string;

  constructor(obj) {
    Object.assign(this, obj);

    if (typeof obj.surveyDate === 'string') {
      obj.surveyDate = obj.surveyDate + ' GMT-0600';
    }
    this.surveyDate = new Date(obj.surveyDate);
  }
}
