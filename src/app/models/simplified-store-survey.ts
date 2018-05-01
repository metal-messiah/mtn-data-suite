import { Entity } from './entity';

export class SimplifiedStoreSurvey implements Entity {

  id: number;
  surveyDate: Date;
  note: string;
  fit: string;
  areaSales: number;
  areaTotal: number;

  constructor(obj) {
    Object.assign(this, obj);
  }

}
