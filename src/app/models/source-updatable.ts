import { SimplifiedStoreStatus } from './simplified/simplified-store-status';
import { DateUtil } from '../utils/date-util';
import { SimplifiedStoreSource } from './simplified/simplified-store-source';

export class SourceUpdatable {

  // Shopping Center
  readonly shoppingCenterId: number;
  shoppingCenterName: string;

  // Site
  readonly siteId: number;
  address: string;
  quad: string;
  intersectionStreetPrimary: string;
  intersectionStreetSecondary: string;
  city: string;
  county: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;

  // Store
  readonly storeId: number;
  storeName: string;
  dateOpened: Date;

  // Only a new status (one without an ID) will be regarded when submitted. (Forbids editing of existing status records)
  storeStatuses: SimplifiedStoreStatus[] = [];

  // Store Survey
  areaTotal: number;

  storeSource: SimplifiedStoreSource;

  constructor(obj?: SourceUpdatable) {
    if (obj) {
      Object.assign(this, obj);
      this.dateOpened = DateUtil.getDate(obj.dateOpened);
      if (obj.storeSource) {
        this.storeSource = new SimplifiedStoreSource(obj.storeSource);
      }
      if (obj.storeStatuses) {
        this.storeStatuses = obj.storeStatuses.map(status => new SimplifiedStoreStatus(status));
      }
    }
  }
}
