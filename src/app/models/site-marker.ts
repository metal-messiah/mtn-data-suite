import { StoreMarker } from './store-marker';
import { Entity } from './entity';
import { DateUtil } from '../utils/date-util';

export class SiteMarker implements Entity {

  id: number;
  latitude: number;
  longitude: number;
  assigneeId: number = null;
  assigneeName: string = null;
  duplicate: boolean;
  backfilledNonGrocery: boolean;
  stores: StoreMarker[];
  updatedDate: Date;

  constructor(obj) {
    Object.assign(this, obj);
    if (obj.updatedDate) {
      this.updatedDate = DateUtil.getDate(obj.updatedDate);
    }

    if (obj.stores) {
      this.stores = obj.stores.map(st => new StoreMarker(st));
    }

    if (obj.assignee) {
      this.assigneeId = obj.assignee.id;
      this.assigneeName = obj.assignee.name;
    }
  }

}
