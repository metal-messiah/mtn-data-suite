import { DateUtil } from '../utils/date-util';
import { SimplifiedStoreSource } from './simplified/simplified-store-source';
import { SimplifiedBanner } from './simplified/simplified-banner';

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
  areaTotal: number;

  banner: SimplifiedBanner;

  storeStatus: string;
  storeStatusStartDate: Date;

  storeSource: SimplifiedStoreSource;

  constructor(obj?: SourceUpdatable) {
    if (obj) {
      Object.assign(this, obj);

      if (obj.banner) {
        this.banner = new SimplifiedBanner(obj.banner);
      }

      if (obj.dateOpened) {
        this.dateOpened = DateUtil.getDate(obj.dateOpened);
      }
      if (obj.storeStatusStartDate) {
        this.storeStatusStartDate = DateUtil.getDate(obj.storeStatusStartDate);
      }

      if (obj.storeSource) {
        this.storeSource = new SimplifiedStoreSource(obj.storeSource);
      }
    }
  }
}
