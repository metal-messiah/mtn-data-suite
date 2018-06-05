import { Entity } from './entity';
import { SimplifiedShoppingCenterSurvey } from './simplified-shopping-center-survey';
import { SimplifiedProject } from './simplified-project';
import { DateUtil } from '../utils/date-util';

export class SimplifiedShoppingCenterCasing implements Entity {

  id: number;
  casingDate: Date;
  note: string;

  shoppingCenterSurvey: SimplifiedShoppingCenterSurvey;
  projects: SimplifiedProject[];

  constructor(obj) {
    Object.assign(this, obj);

    if (obj.casingDate != null) {
      this.casingDate = DateUtil.getDate(obj.casingDate);
    }
    if (obj.shoppingCenterSurvey != null) {
      this.shoppingCenterSurvey = new SimplifiedShoppingCenterSurvey(obj.shoppingCenterSurvey);
    }
    if (obj.projects != null) {
      this.projects = obj.projects.map((p) => new SimplifiedProject(p));
    }
  }
}
