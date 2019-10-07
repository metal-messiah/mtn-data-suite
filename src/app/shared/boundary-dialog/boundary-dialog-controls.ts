
import * as _ from 'lodash';
import { Boundary } from 'app/models/full/boundary';

class BoundaryDialogControl {
  boundary: Boundary;
  enabled = false;

  constructor(obj?: BoundaryDialogControl) {
    Object.assign(this, obj);
  }
}

export class BoundaryDialogControls {

  projectBoundaries: BoundaryDialogControl[];
  geoPoliticalBoundaries: BoundaryDialogControl[];
  customBoundaries: BoundaryDialogControl[];

  constructor(obj?: any) {
    if (obj) {
      Object.assign(this, obj);
      if (obj.projectBoundaries) {
        this.projectBoundaries = obj.map(b => new BoundaryDialogControl(b));
      }
      if (obj.geoPoliticalBoundaries) {
        this.geoPoliticalBoundaries = obj.map(b => new BoundaryDialogControl(b));
      }
      if (obj.customBoundaries) {
        this.customBoundaries = obj.map(b => new BoundaryDialogControl(b));
      }
    } else {
      this.reset();
    }
  }

  private reset() {
    this.projectBoundaries = [];
    this.geoPoliticalBoundaries = [];
    this.customBoundaries = [];
  }
}
