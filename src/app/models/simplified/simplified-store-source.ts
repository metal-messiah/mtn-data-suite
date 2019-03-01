import { Entity } from '../entity';

export class SimplifiedStoreSource implements  Entity {

  id: number;
  sourceName: string;
  sourceNativeId: string;
  sourceUrl: string;
  sourceStoreName: string;
  sourceBannerName: string;
  validatedDate: Date;

  constructor(obj?) {
    Object.assign(this, obj);
  }
}
