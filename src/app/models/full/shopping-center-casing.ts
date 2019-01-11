import { AuditingEntity } from '../auditing-entity';
import { SimplifiedProject } from '../simplified/simplified-project';
import { ShoppingCenterSurvey } from './shopping-center-survey';
import { DateUtil } from '../../utils/date-util';

export class ShoppingCenterCasing extends AuditingEntity {

  casingDate: Date;
  note: string;
  ratingBuildings: string;
  ratingLighting: string;
  ratingSynergy: string;
  ratingTenantBuildings: string;
  legacyCasingId: number;

  projects: SimplifiedProject[];
  shoppingCenterSurvey: ShoppingCenterSurvey;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);

    if (obj.casingDate != null) {
      this.casingDate = DateUtil.getDate(obj.casingDate);
    }
    if (obj.projects != null) {
      this.projects = obj.projects.map(project => new SimplifiedProject(project));
    }
    if (obj.shoppingCenterSurvey != null) {
      this.shoppingCenterSurvey = new ShoppingCenterSurvey(obj.shoppingCenterSurvey);
    }
  }
}
