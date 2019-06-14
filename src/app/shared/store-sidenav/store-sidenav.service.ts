import { Injectable } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';

@Injectable()
export class StoreSidenavService {

  private readonly STORE_LIST_STORAGE_KEY = 'showStoreLists';

  private _showing = false;

  constructor(private storageService: StorageService) {
    console.log('Constructor - store-side-nav-service');
    this.getPersistedState();
  }

  private getPersistedState() {
    this.storageService.getOne(this.STORE_LIST_STORAGE_KEY).subscribe(shouldShow => {
      // Set if true (default is false)
      if (shouldShow) {
        this.setShowing(true);
      }
    });
  }

  setShowing(show: boolean) {
    this._showing = show;
    // Save the state
    this.storageService.set(this.STORE_LIST_STORAGE_KEY, this._showing).subscribe()
  }

  get showing() {
    return this._showing;
  }

}
