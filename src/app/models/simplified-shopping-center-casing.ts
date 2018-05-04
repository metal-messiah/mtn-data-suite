import { Entity } from './entity';
import { SimplifiedShoppingCenterSurvey } from './simplified-shopping-center-survey';

export class SimplifiedShoppingCenterCasing implements Entity {

  id: number;
  casingDate: Date;
  note: string;

  shoppingCenterSurvey: SimplifiedShoppingCenterSurvey;

  constructor(obj) {
    Object.assign(this, obj);
    if (obj.shoppingCenterSurvey != null) {
      this.shoppingCenterSurvey = new SimplifiedShoppingCenterSurvey(obj.shoppingCenterSurvey);
    }
  }
}
