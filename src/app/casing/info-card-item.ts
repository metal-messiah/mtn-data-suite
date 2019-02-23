import { Type } from '@angular/core';
import { InfoCardInterface } from './info-card-interface';

export class InfoCardItem {
  constructor(public component: Type<InfoCardInterface>,
              public data: any,
              public callbacks: any) {}
}
