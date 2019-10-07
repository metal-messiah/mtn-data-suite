import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CasingDashboardMode } from '../enums/casing-dashboard-mode';
import { StorageService } from '../../core/services/storage.service';

@Injectable()
export class CasingDashboardService {

  private readonly STORE_LIST_STORAGE_KEY = 'showStoreLists';

  // StoreList sidenav control
  private _showingStoreListSidenav = false;

  selectedDashboardMode = CasingDashboardMode.DEFAULT;

  constructor(private dialog: MatDialog,
              private storageService: StorageService) {
    this.getPersistedState();
  }

  private getPersistedState() {
    this.storageService.getOne(this.STORE_LIST_STORAGE_KEY).subscribe(shouldShow => {
      // Set if true (default is false)
      if (shouldShow) {
        this.setShowingStoreListSidenav(true);
      }
    });
  }

  setShowingStoreListSidenav(show: boolean) {
    this._showingStoreListSidenav = show;
    // Save the state
    this.storageService.set(this.STORE_LIST_STORAGE_KEY, this._showingStoreListSidenav).subscribe();
  }

  get showingStoreListSidenav() {
    return this._showingStoreListSidenav;
  }

}
