import { Entity } from './entity';

export class SimplifiedBanner implements Entity {

  id: number;
  bannerName: string;

  constructor(obj?) {
    Object.assign(this, obj);
  }

}
