import { Entity } from '../entity';
import { SimplifiedStoreVolume } from './simplified-store-volume';
import { SimplifiedStoreSurvey } from './simplified-store-survey';
import { SimplifiedProject } from './simplified-project';
import { DateUtil } from '../../utils/date-util';
import { SimplifiedShoppingCenterCasing } from './simplified-shopping-center-casing';

export class SimplifiedStoreCasing implements Entity {

  id: number;
  casingDate: Date;
  note: string;
  storeStatus: string;

  storeVolume: SimplifiedStoreVolume;
  storeSurvey: SimplifiedStoreSurvey;
  projects: SimplifiedProject[];
  shoppingCenterCasing: SimplifiedShoppingCenterCasing;

  constructor(obj) {
    Object.assign(this, obj);

    if (obj.casingDate != null) {
      this.casingDate = DateUtil.getDate(obj.casingDate);
    }
    if (obj.storeVolume != null) {
      this.storeVolume = new SimplifiedStoreVolume(obj.storeVolume);
    }
    if (obj.storeSurvey != null) {
      this.storeSurvey = new SimplifiedStoreSurvey(obj.storeSurvey);
    }
    if (obj.projects != null) {
      this.projects = obj.projects.map(project => new SimplifiedProject(project));
    }
    if (obj.shoppingCenterCasing != null) {
      this.shoppingCenterCasing = new SimplifiedShoppingCenterCasing(obj.shoppingCenterCasing);
    }
  }

}
