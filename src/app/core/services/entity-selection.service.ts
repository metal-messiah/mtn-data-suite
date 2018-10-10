import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EntitySelectionService {

  siteIds = new Set<number>();
  storeIds = new Set<number>();

  constructor() {}

  clearSelectedIds() {
    this.siteIds.clear();
    this.storeIds.clear();
  }
}
