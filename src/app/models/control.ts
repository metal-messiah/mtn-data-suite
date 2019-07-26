import { DbEntityMarkerControls } from './db-entity-marker-controls';

export enum ControlStorageKeys {
  savedDbEntityMarkerServiceControls = 'savedDbEntityMarkerServiceControls'
}

export class Control {
  name: string;
  date: Date;
  control: DbEntityMarkerControls;

  constructor(name: string, date: Date, control: DbEntityMarkerControls) {
    this.name = name;
    this.date = date;
    this.control = new DbEntityMarkerControls(control);
  }
}
