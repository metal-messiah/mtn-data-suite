import { DbEntityMarkerControls } from '../core/services/db-entity-marker.service';

export enum ControlStorageKeys {
    dbEntityMarkerServiceControls = 'dbEntityMarkerServiceControls',
    savedDbEntityMarkerServiceControls = 'savedDbEntityMarkerServiceControls'
}
export class Control {
    name: string;
    date: Date;
    control: DbEntityMarkerControls;

    constructor(name: string, date: Date, control: DbEntityMarkerControls) {
        this.name = name;
        this.date = date;
        this.control = control;
    }
}