import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Entity } from '../../models/entity';
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

@Component({
  selector: 'mds-db-location-info-card',
  templateUrl: './db-location-info-card.component.html',
  styleUrls: ['./db-location-info-card.component.css']
})
export class DbLocationInfoCardComponent implements OnInit, OnChanges {

  @Input() selection: { storeId: number, siteId: number };
  @Input() disableActions: boolean;

  site: Site;
  store: Store;

  @Output() onSiteUpdated$ = new EventEmitter<Site>();
  @Output() onStoreUpdated$ = new EventEmitter<Store>();
  @Output() initiateMove = new EventEmitter<Site>();
  @Output() initiateDuplicateSiteSelection = new EventEmitter<Entity>();

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
    this.siteService.getOneById(this.selection.siteId).subscribe((site: Site) => this.initSite(site));
  }

  private initSite(site: Site) {
    this.site = site;
    if (this.selection.storeId) {
      this.initStore(site.stores.find(store => store.id === this.selection.storeId));

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
    this.initiateMove.emit(this.site);
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
        this.onSiteUpdated$.emit(this.site);
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
    this.initiateDuplicateSiteSelection.emit(this.site);
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
        this.onSiteUpdated$.emit(this.site);
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
        this.onStoreUpdated$.emit(store);
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
          this.onStoreUpdated$.emit(store);
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
          this.onStoreUpdated$.emit(store);
        },
        err => this.errorService.handleServerError('Failed to invalidate store', err,
          () => console.log('cancelled'),
          () => this.validateStore()))
  }

}
