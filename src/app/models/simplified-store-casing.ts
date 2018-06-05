import { Entity } from './entity';
import { SimplifiedStoreVolume } from './simplified-store-volume';
import { SimplifiedStoreStatus } from './simplified-store-status';
import { SimplifiedStoreSurvey } from './simplified-store-survey';
import { SimplifiedProject } from './simplified-project';

export class SimplifiedStoreCasing implements Entity {

  id: number;
  casingDate: Date;
  note: string;

  storeVolume: SimplifiedStoreVolume;
  storeStatus: SimplifiedStoreStatus;
  storeSurvey: SimplifiedStoreSurvey;
  projects: SimplifiedProject[];

  constructor(obj) {
    Object.assign(this, obj);

    if (typeof obj.casingDate === 'string') {
      obj.casingDate = obj.casingDate + ' GMT-0600';
    }
    this.casingDate = new Date(obj.casingDate);
    if (obj.storeVolume != null) {
      this.storeVolume = new SimplifiedStoreVolume(obj.storeVolume);
    }
    if (obj.storeStatus != null) {
      this.storeStatus = new SimplifiedStoreStatus(obj.storeStatus);
    }
    if (obj.storeSurvey != null) {
      this.storeSurvey = new SimplifiedStoreSurvey(obj.storeSurvey);
    }
    if (obj.projects != null) {
      this.projects = obj.projects.map(project => new SimplifiedProject(project));
    }
  }

}
