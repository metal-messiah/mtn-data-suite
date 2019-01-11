import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/full/site';
import { Store } from '../../models/full/store';
import { MatDialog, MatSnackBar } from '@angular/material';
import { UserProfileSelectComponent } from '../../shared/user-profile-select/user-profile-select.component';
import { SimplifiedUserProfile } from '../../models/simplified/simplified-user-profile';
import { ErrorService } from '../../core/services/error.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { StoreService } from '../../core/services/store.service';
import { finalize } from 'rxjs/internal/operators';
import { AuthService } from '../../core/services/auth.service';
import { StoreSelectionDialogComponent } from '../store-merge/store-selection-dialog/store-selection-dialog.component';

@Component({
  selector: 'mds-site-overview',
  templateUrl: './site-overview.component.html',
  styleUrls: ['./site-overview.component.css']
})
export class SiteOverviewComponent implements OnInit {

  site: Site;
  activeStore: Store;
  futureStores: Store[];
  historicalStores: Store[];
  warningHasMultipleActiveStores = false;
  saving = false;
  loading = false;

  constructor(private _location: Location,
              private router: Router,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private siteService: SiteService,
              private storeService: StoreService,
              private authService: AuthService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    const siteId = parseInt(this.route.snapshot.paramMap.get('siteId'), 10);
    this.loadSite(siteId);
  }

  loadSite(siteId: number) {
    this.loading = true;
    this.siteService.getOneById(siteId)
      .pipe(finalize(() => this.loading = false))
      .subscribe(site => {
        this.site = site;
        this.setStores(this.site.stores);
      }, err => this.errorService.handleServerError('Failed to load site!', err,
        () => this.goBack(),
        () => this.loadSite(siteId)));
  }

  private setStores(stores: Store[]) {
    this.historicalStores = [];
    this.activeStore = null;
    this.futureStores = [];
    stores.forEach(store => {
      if (store.storeType === 'ACTIVE') {
        if (this.activeStore != null) {
          this.warningHasMultipleActiveStores = true;
        }
        this.activeStore = store;
      } else if (store.storeType === 'FUTURE') {
        this.futureStores.push(store);
      } else {
        this.historicalStores.push(store);
      }
    });
    this.historicalStores = this.historicalStores.sort((a: Store, b: Store) => {
      if (a.currentStoreStatus != null && b.currentStoreStatus != null) {
        return b.currentStoreStatus.statusStartDate.getTime() - a.currentStoreStatus.statusStartDate.getTime();
      }
      return 0;
    });
  }

  goBack() {
    this._location.back();
  };

  openAssignmentDialog(): void {
    const selectAssigneeDialog = this.dialog.open(UserProfileSelectComponent);
    selectAssigneeDialog.afterClosed().subscribe((user: SimplifiedUserProfile) => {
      if (user != null) {
        this.assignToUser(user);
      }
    });
  }

  assignToSelf() {
    this.assignToUser(new SimplifiedUserProfile(this.authService.sessionUser));
  }

  assignToUser(user: SimplifiedUserProfile) {
    this.saving = true;
    const previousAssignee = this.site.assignee;
    this.site.assignee = user;
    this.siteService.update(this.site).subscribe(site => {
      this.site = site;
      this.setStores(this.site.stores);
      this.snackBar.open('Successfully updated assignment', null, {duration: 2000});
    }, err => {
      this.site.assignee = previousAssignee;
      this.errorService.handleServerError('Failed to update assignment', err,
        () => console.log('Cancelled'),
        () => this.assignToUser(user));
    }, () => this.saving = false);
  }

  setDuplicateFlag(isDuplicate: boolean) {
    this.site.duplicate = isDuplicate;
    this.siteService.update(this.site).subscribe(site => {
      this.site = site;
      this.setStores(this.site.stores);
      this.snackBar.open('Successfully updated Site', null, {duration: 2000});
    }, err => {
      this.site.duplicate = !this.site.duplicate;
      this.errorService.handleServerError('Failed to update site', err,
        () => {
        },
        () => this.setDuplicateFlag(isDuplicate));
    }, () => this.saving = false);
  }

  createNewStore(storeType: string) {
    const newStore = new Store({
      storeType: storeType
    });
    if (storeType === 'ACTIVE' && this.futureStores.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Future store exists',
          question: `Create: Create a new active store.\nMove: Transition the current future store 
          (${this.futureStores[0].storeName}) to be the active store.`,
          options: ['Create', 'Move']
        }
      });
      dialogRef.afterClosed().subscribe((result: string) => {
        if (result === 'Create') {
          this.saveNewStore(newStore);
        } else if (result === 'Move') {
          this.transitionFutureToActive();
        }
      });
    } else {
      this.saveNewStore(newStore);
    }
  }

  private transitionFutureToActive() {
    const prevStoreType = this.futureStores[0].storeType;
    this.futureStores[0].storeType = 'ACTIVE';
    this.saving = true;
    this.storeService.update(this.futureStores[0])
      .pipe(finalize(() => this.saving = false))
      .subscribe((store: Store) => {
        this.snackBar.open('Updated Store Type', null, {duration: 2000});
        this.updateStoreView(store);
      }, err => {
        this.futureStores[0].storeType = prevStoreType;
        this.errorService.handleServerError('Failed to update store type', err,
          () => console.log('Cancelled'),
          () => this.transitionFutureToActive());
      });
  }

  private updateStoreView(store: Store) {
    const index = this.site.stores.findIndex((st: Store) => st.id === store.id);
    this.site.stores[index] = store;
    this.setStores(this.site.stores);
  }

  private saveNewStore(newStore: Store) {
    this.saving = true;
    this.siteService.addNewStore(this.site.id, newStore)
      .pipe(finalize(() => this.saving = false))
      .subscribe((store: Store) => {
        this.snackBar.open('Successfully created Store', null, {duration: 2000});
        this.router.navigate(['/casing/store', store.id], {relativeTo: this.route});
      }, err => this.errorService.handleServerError('Failed to create new store!', err,
        () => console.log('Cancelled'), () => this.saveNewStore(newStore)));
  }

  openStoreMergeDialog(): void {
    this.dialog.open(StoreSelectionDialogComponent, {
      data: {site: this.site}
    });
    console.log('Opened Store Merge Dialog');
  }
}
