import { AuditingEntity } from './auditing-entity';
import { SimplifiedStoreModel } from './simplified-store-model';
import { SimplifiedInteraction } from './simplified-interaction';

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

  interactions: SimplifiedInteraction[];
  models: SimplifiedStoreModel[];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.interactions != null) {
      this.interactions = obj.interactions.map(interaction => new SimplifiedInteraction(interaction));
    }
    if (obj.models != null) {
      this.models = obj.models.map(model => new SimplifiedStoreModel(model));
    }
  }
}
