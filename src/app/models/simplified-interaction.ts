import { Entity } from './entity';
import { SimplifiedProject } from './simplified-project';

export class SimplifiedInteraction implements Entity {

  id: number;
  project: SimplifiedProject;
  interactionDate: Date;

  constructor(obj) {
    Object.assign(this, obj);
    if (obj.project != null) {
      this.project = new SimplifiedProject(obj.project);
    }
  }
}
