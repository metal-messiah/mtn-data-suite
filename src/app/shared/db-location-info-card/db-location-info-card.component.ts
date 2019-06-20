import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SiteService } from '../../core/services/site.service';
import { ErrorService } from '../../core/services/error.service';
import { StoreService } from '../../core/services/store.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../models/full/user-profile';
import { UserProfileSelectComponent } from '../user-profile-select/user-profile-select.component';
import { Store } from '../../models/full/store';
import { Site } from '../../models/full/site';
import { DbEntityInfoCardItem } from '../../casing/db-entity-info-card-item';
import {
  AddRemoveStoresListDialogComponent,
  AddRemoveType
} from '../add-remove-stores-list-dialog/add-remove-stores-list-dialog.component';
import { SimplifiedSite } from '../../models/simplified/simplified-site';

@Component({
  selector: 'mds-db-location-info-card',
  templateUrl: './db-location-info-card.component.html',
  styleUrls: ['./db-location-info-card.component.css']
})
export class DbLocationInfoCardComponent implements OnInit, OnChanges {

  @Input() infoCardItem: DbEntityInfoCardItem;
  @Input() disabled: boolean;

  site: SimplifiedSite;
  store: Store;

  constructor(private siteService: SiteService,
              private storeService: StoreService,
              private errorService: ErrorService,
              private router: Router,
              private snackBar: MatSnackBar,
              private authService: AuthService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.site = null;
    this.store = null;
    this.initData();
  }

  private initData() {
    if (this.infoCardItem.selection.storeId) {
      this.storeService.getOneById(this.infoCardItem.selection.storeId).subscribe((store: Store) => {
        this.initStore(store);
        this.initSite(store.site);
      })
    } else if (this.infoCardItem.selection.siteId) {
      this.siteService.getOneById(this.infoCardItem.selection.siteId).subscribe((site: Site) => this.initSite(new SimplifiedSite(site)));
    }
  }

  private initSite(site: SimplifiedSite) {
    this.site = site;
  }

  private initStore(store: Store) {
    // Select the store by ID
    this.store = store;
    if (this.store) {
      if (this.store.storeVolumes && this.store.storeVolumes.length > 0) {
        // Get the store's latest volume
        this.store['latestStoreVolume'] = this.store.storeVolumes.sort((a, b) => b.volumeDate.getTime() - a.volumeDate.getTime())[0];
      }
    }
  }

  goToSiteOverview(): void {
    this.router.navigate(['casing/site', this.site.id]);
  }

  moveSite() {
    this.infoCardItem.initiateSiteMove$.next(this.site);
  }

  initiateDuplicateSelection() {
    this.infoCardItem.initiateDuplicateSelection$.next(this.site.id);
  }

  assignToSelf() {
    this.assign(this.authService.sessionUser.id);
  }

  assignToUser(user: UserProfile) {
    this.assign((user != null) ? user.id : null);
  }

  private assign(userId: number) {
    return this.siteService.assignSiteToUser(this.site.id, userId)
      .subscribe((site: Site) => {
        this.initSite(new SimplifiedSite(site));
        this.snackBar.open('Successfully assigned Site', null, {duration: 1000});
        this.infoCardItem.refreshSite$.next(site.id);
      }, err => this.errorService.handleServerError('Failed to update site', err,
        () => console.log('Cancelled'),
        () => this.assign(userId)));
  }

  openAssignmentDialog() {
    const selectAssigneeDialog = this.dialog.open(UserProfileSelectComponent);
    selectAssigneeDialog.afterClosed().subscribe(selectedUser => {
      if (selectedUser != null) {
        this.assignToUser(selectedUser);
      }
    });
  }

  copyToClipboard(val) {
    console.log('copying');
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.snackBar.open(`${val} copied to clipboard`, null, {duration: 1000});
  }

  setDuplicateFlag(isDuplicate: boolean) {
    this.siteService.getOneById(this.site.id).subscribe(fullSite => {
      fullSite.duplicate = isDuplicate;
      return this.siteService.update(fullSite)
        .subscribe((site: Site) => {
          this.initSite(new SimplifiedSite(site));
          this.snackBar.open('Successfully updated Site', null, {duration: 1000});
          this.infoCardItem.refreshSite$.next(this.site.id);
        }, err => this.errorService.handleServerError('Failed to update Site!', err,
          () => this.site.duplicate = !isDuplicate,
          () => this.setDuplicateFlag(isDuplicate)
        ));
    });
  }

  setFloating(floating: boolean) {
    this.store.floating = floating;
    this.storeService.update(this.store)
      .subscribe((store: Store) => {
        this.initStore(store);
        this.infoCardItem.refreshSite$.next(this.site.id);
        this.snackBar.open(`Updated Store`, null, {duration: 2000});
      }, err => this.errorService.handleServerError('Failed to update store', err,
        () => this.store.floating = !floating,
        () => this.setFloating(floating)));
  }

  validateStore() {
    this.storeService.validateStore(this.store.id)
      .subscribe((store: Store) => {
          this.initStore(store);
          this.snackBar.open(`Validated Store`, null, {duration: 2000});
          this.infoCardItem.refreshSite$.next(this.site.id);
        },
        err => this.errorService.handleServerError('Failed to validate store', err,
          () => console.log('cancelled'),
          () => this.validateStore()))
  }

  invalidateStore() {
    this.storeService.invalidateStore(this.store.id)
      .subscribe((store: Store) => {
          this.initStore(store);
          this.snackBar.open(`Invalidated Store`, null, {duration: 2000});
          this.infoCardItem.refreshSite$.next(this.site.id);
        },
        err => this.errorService.handleServerError('Failed to invalidate store', err,
          () => console.log('cancelled'),
          () => this.validateStore()))
  }

  addToList() {
    const storeIds = [this.infoCardItem.selection.storeId];
    if (storeIds.length) {
      this.dialog.open(AddRemoveStoresListDialogComponent, {data: {type: AddRemoveType.ADD, storeIds}, disableClose: true});
    }
  }

  removeFromList() {
    const storeIds = [this.infoCardItem.selection.storeId];
    if (storeIds.length) {
      this.dialog.open(AddRemoveStoresListDialogComponent, {data: {type: AddRemoveType.REMOVE, storeIds}, disableClose: true});
    }
  }

  getFormattedIntersection(site) {
    return this.siteService.getFormattedIntersection(site);
  }

  getFormattedPrincipality(site) {
    return this.siteService.getFormattedPrincipality(site);
  }

}
