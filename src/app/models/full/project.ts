import { AuditingEntity } from '../auditing-entity';
import { SimplifiedStoreModel } from '../simplified/simplified-store-model';
import { SimplifiedStoreCasing } from '../simplified/simplified-store-casing';
import { SimplifiedShoppingCenterCasing } from '../simplified/simplified-shopping-center-casing';
import { DateUtil } from '../../utils/date-util';
import { SimplifiedStoreList } from '../simplified/simplified-store-list';

export class Project extends AuditingEntity {
  projectName: string;
  metroArea: string;
  clientName: string;
  projectYear: number;
  projectMonth: number;
  active: boolean;
  primaryData: boolean;
  dateStarted: Date;
  dateCompleted: Date;
  source: string;
  legacyProjectId: number;

  models: SimplifiedStoreModel[];
  storeCasings: SimplifiedStoreCasing[];
  shoppingCenterCasings: SimplifiedShoppingCenterCasing[];

  updatedStores: SimplifiedStoreList;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.models != null) {
      this.models = obj.models.map((model) => new SimplifiedStoreModel(model));
    }
    if (obj.storeCasings != null) {
      this.storeCasings = obj.storeCasings.map((storeCasing) => new SimplifiedStoreCasing(storeCasing));
    }
    if (obj.shoppingCenterCasings != null) {
      this.shoppingCenterCasings = obj.shoppingCenterCasings.map(
        (shoppingCenterCasing) => new SimplifiedShoppingCenterCasing(shoppingCenterCasing)
      );
    }
    if (obj.dateStarted) {
      this.dateStarted = DateUtil.getDate(obj.dateStarted);
    }
    if (obj.dateCompleted) {
      this.dateCompleted = DateUtil.getDate(obj.dateCompleted);
    }
    if (obj.updatedStores) {
      this.updatedStores = new SimplifiedStoreList(obj.updatedStores);
    }
  }
}
