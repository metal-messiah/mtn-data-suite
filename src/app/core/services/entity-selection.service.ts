import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class EntitySelectionService {

  multiSelect = false;
  deselecting = false;

  readonly singleSelect$ = new Subject<{storeId: number, siteId: number}>();
  readonly selectionUpdated$ = new Subject<void>();

  // Only for Empty sites since they have no store sto select
  readonly siteIds = new Set<number>();
  readonly storeIds = new Set<number>();

  selectByIds(ids: { siteIds: number[], storeIds: number[] }) {
    // If not in multi-select mode, deselect previously selected markers
    if (!this.multiSelect) {
      this.clearAll();
    }
    if (this.deselecting) {
      ids.siteIds.forEach(id => this.siteIds.delete(id));
      ids.storeIds.forEach(id => this.storeIds.delete(id));
    } else {
      ids.siteIds.forEach(id => this.siteIds.add(id));
      ids.storeIds.forEach(id => this.storeIds.add(id));
    }
    this.selectionUpdated$.next();
  }

  singleSelect(ids: {storeId: number, siteId: number}) {
    if (ids.storeId) {
      this.selectByIds({storeIds: [ids.storeId], siteIds: []});
    } else {
      this.selectByIds({storeIds: [], siteIds: [ids.siteId]})
    }
    this.singleSelect$.next(ids);
  }

  clearSelection() {
    this.clearAll();
    this.selectionUpdated$.next();
  }

  private clearAll() {
    this.siteIds.clear();
    this.storeIds.clear();
  }
}
