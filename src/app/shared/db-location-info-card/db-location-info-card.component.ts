import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SiteService } from '../../core/services/site.service';
import { ErrorService } from '../../core/services/error.service';
import { StoreService } from '../../core/services/store.service';
import { Router } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../models/full/user-profile';
import { UserProfileSelectComponent } from '../user-profile-select/user-profile-select.component';
import { Store } from '../../models/full/store';
import { Site } from '../../models/full/site';
import { InfoCardInterface } from '../../casing/info-card-interface';

@Component({
  selector: 'mds-db-location-info-card',
  templateUrl: './db-location-info-card.component.html',
  styleUrls: ['./db-location-info-card.component.css']
})
export class DbLocationInfoCardComponent implements OnInit, OnChanges, InfoCardInterface {

  @Input() data: {selection: { storeId: number, siteId: number }};
  @Input() disabled: boolean;
  @Input() callbacks: any;

  site: Site;
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
    this.fetchSite();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.site = null;
    this.store = null;
    this.fetchSite();
  }

  private fetchSite() {
    this.siteService.getOneById(this.data.selection.siteId).subscribe((site: Site) => this.initSite(site));
  }

  private initSite(site: Site) {
    this.site = site;
    if (this.data.selection.storeId) {
      this.initStore(site.stores.find(store => store.id === this.data.selection.storeId));
    }
  }

  private initStore(store: Store) {
    // Select the store by ID
    this.store = store;
    if (this.store.storeVolumes && this.store.storeVolumes.length > 0) {
      // Get the store's latest volume
      this.store['latestStoreVolume'] = this.store.storeVolumes.sort((a, b) => {
        return b.volumeDate.getMilliseconds() - a.volumeDate.getMilliseconds();
      })[0];
    }
  }

  goToSiteOverview(): void {
    this.router.navigate(['casing/site', this.site.id]);
  }

  moveSite() {
    this.callbacks.initiateMove(this.site);
  }

  assignToSelf() {
    this.assign(this.authService.sessionUser.id);
  }

  assignToUser(user: UserProfile) {
    this.assign((user != null) ? user.id : null);
  }

  private assign(userId: number) {
    return this.siteService.assignSiteToUser(this.site, userId)
      .subscribe((sites: Site) => {
        this.initSite(sites);
        this.snackBar.open('Successfully assigned Site', null, {duration: 1000});
        this.callbacks.onSiteUpdated(this.site);
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

  initiateDuplicateSelection() {
    this.callbacks.initiateDuplicateSiteSelection(this.site.id);
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
    // Get full site
    this.site.duplicate = isDuplicate;
    return this.siteService.update(this.site)
      .subscribe((site: Site) => {
        this.initSite(site);
        this.snackBar.open('Successfully updated Site', null, {duration: 1000});
        this.callbacks.refresh();
      }, err => this.errorService.handleServerError('Failed to update Site!', err,
        () => this.site.duplicate = !isDuplicate,
        () => this.setDuplicateFlag(isDuplicate)
      ));
  }

  setFloating(floating: boolean) {
    this.store.floating = floating;
    this.storeService.update(this.store)
      .subscribe((store: Store) => {
        this.initStore(store);
        this.callbacks.refresh();
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
          this.callbacks.refresh();
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
          this.callbacks.refresh();
        },
        err => this.errorService.handleServerError('Failed to invalidate store', err,
          () => console.log('cancelled'),
          () => this.validateStore()))
  }

}
