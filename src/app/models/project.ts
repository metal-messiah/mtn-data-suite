import { AuditingEntity } from './auditing-entity';
import { SimplifiedStoreModel } from './simplified-store-model';
import { SimplifiedStoreCasing } from './simplified-store-casing';
import { SimplifiedShoppingCenterCasing } from './simplified-shopping-center-casing';

export class Project extends AuditingEntity {

  projectName: string;
  metroArea: string;
  clientName: string;
  projectYear: number;
  projectMonth: number;
  active: boolean;
  primary: boolean;
  dateStarted: Date;
  dateCompleted: Date;
  source: string;
  legacyProjectId: number;

  models: SimplifiedStoreModel[];
  storeCasings: SimplifiedStoreCasing[];
  shoppingCenterCasings: SimplifiedShoppingCenterCasing[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.models != null) {
      this.models = obj.models.map(model => new SimplifiedStoreModel(model));
    }
    if (obj.storeCasings != null) {
      this.storeCasings = obj.storeCasings.map(storeCasing => new SimplifiedStoreCasing(storeCasing));
    }
    if (obj.shoppingCenterCasings != null) {
      this.shoppingCenterCasings = obj.shoppingCenterCasings.map(shoppingCenterCasing => {
        new SimplifiedShoppingCenterCasing(shoppingCenterCasing);
      });
    }
  }
}
