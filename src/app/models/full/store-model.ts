import { AuditingEntity } from '../auditing-entity';
import { SimplifiedProject } from '../simplified/simplified-project';
import { SimplifiedStore } from '../simplified/simplified-store';
import { DateUtil } from '../../utils/date-util';

export class StoreModel extends AuditingEntity {

  mapkey: string;
  curve: number;
  pwta: number;
  power: number;
  fitAdjustedPower: number;
  modelDate: Date;
  legacyCasingId: number;
  modelType: string;

  store: SimplifiedStore;
  project: SimplifiedProject;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    this.modelDate = DateUtil.getDate(obj.modelDate);
    if (obj.store != null) {
      this.store = new SimplifiedStore(obj.store);
    }
    if (obj.project != null) {
      this.project = new SimplifiedProject(obj.project);
    }
  }
}
