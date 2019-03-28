import { Type } from '@angular/core';
import { InfoCardItem } from './info-card-item';
import { Subject } from 'rxjs';
import { Site } from '../models/full/site';

export class DbEntityInfoCardItem extends InfoCardItem {
  constructor(public component: Type<any>,
              public selection: {storeId: number, siteId: number},
              public initiateDuplicateSelection$: Subject<number>,
              public initiateSiteMove$: Subject<Site>,
              public refreshSite$: Subject<number>) {
    super(component);
  }
}
