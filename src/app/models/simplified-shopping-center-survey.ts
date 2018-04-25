import { Entity } from './entity';

export class SimplifiedShoppingCenterSurvey implements Entity {

  id: number;
  surveyDate: Date;
  centerType: string;
  note: string;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
