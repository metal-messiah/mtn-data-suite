import { Entity } from './entity';
import { SimplifiedStoreVolume } from './simplified-store-volume';
import { SimplifiedStoreStatus } from './simplified-store-status';
import { SimplifiedStoreSurvey } from './simplified-store-survey';

export class SimplifiedStoreCasing implements Entity {

  id: number;
  casingDate: Date;
  note: string;
  status: string;
  volumeNote: string;
  volumeConfidence: string;
  doesNotExist: string;

  storeVolume: SimplifiedStoreVolume;
  storeStatus: SimplifiedStoreStatus;
  storeSurvey: SimplifiedStoreSurvey;

  constructor(obj) {
    Object.assign(this, obj);
    if (obj.storeVolume != null) {
      this.storeVolume = new SimplifiedStoreVolume(obj.storeVolume);
    }
    if (obj.storeStatus != null) {
      this.storeStatus = new SimplifiedStoreStatus(obj.storeStatus);
    }
    if (obj.storeSurvey != null) {
      this.storeSurvey = new SimplifiedStoreSurvey(obj.storeSurvey);
    }
  }

}
