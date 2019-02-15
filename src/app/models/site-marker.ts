import { StoreMarker } from './store-marker';
import { Entity } from './entity';

export class SiteMarker implements Entity {

  id: number;
  latitude: number;
  longitude: number;
  assigneeId: number;
  isDuplicate: boolean;
  isBackfilledNonGrocery: boolean;
  stores: StoreMarker[];

  constructor(obj) {
    Object.assign(this, obj);
  }
}
