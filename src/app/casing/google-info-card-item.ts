import { Type } from '@angular/core';
import { InfoCardItem } from './info-card-item';
import { GooglePlace } from '../models/google-place';

export class GoogleInfoCardItem extends InfoCardItem {
  constructor(public component: Type<any>,
              public googlePlace: GooglePlace) {
    super(component);
  }
}
