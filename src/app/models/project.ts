import {AuditingEntity} from './auditing-entity';
import { Interaction } from './interaction';

export class Project extends AuditingEntity {
  id: number;
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

  interactions: Interaction[];
  // TODO Add StoreModel
}
