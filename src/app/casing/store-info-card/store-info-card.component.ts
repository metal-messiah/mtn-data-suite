import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '../../models/store';
import { Router } from '@angular/router';
import { CasingDashboardMode } from '../casing-dashboard/casing-dashboard.component';
import { SiteService } from '../../core/services/site.service';
import { ErrorService } from '../../core/services/error.service';
import { Site } from '../../models/site';
import { UserProfileSelectComponent } from '../../shared/user-profile-select/user-profile-select.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { UserProfile } from '../../models/user-profile';
import { StoreService } from '../../core/services/store.service';
import { SimplifiedStore } from '../../models/simplified-store';

@Component({
  selector: 'mds-store-info-card',
  templateUrl: './store-info-card.component.html',
  styleUrls: ['./store-info-card.component.css']
})
export class StoreInfoCardComponent implements OnInit {

  @Input() store: SimplifiedStore|Store;
  @Input() disableActions: boolean;

  @Output() onStoreUpdated = new EventEmitter<SimplifiedStore|Store>();
  @Output() onMoveStore = new EventEmitter<SimplifiedStore|Store>();

  constructor(private router: Router,
              public siteService: SiteService,
              public storeService: StoreService,
              private errorService: ErrorService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog) {
  }

  ngOnInit() {
  }

  goToSiteOverview(): void {
    this.router.navigate(['casing/site', this.store.site.id]);
  }

  pinLocation(): void {
    // TODO create the location data to the device
  }

  setDuplicateFlag(isDuplicate: boolean) {
    // Get full site
    this.siteService.getOneById(this.store.site.id).subscribe(site => {
      site.duplicate = isDuplicate;
      this.siteService.update(site).subscribe(s => {
        this.store.site = s;
        this.onStoreUpdated.emit(this.store);
      }, err => {
        site.duplicate = !site.duplicate;
        this.errorService.handleServerError('Failed to update store', err,
          () => {
          },
          () => this.setDuplicateFlag(isDuplicate));
      });
    }, err => {
      // TODO Cannot find site
    });
  }

  assignStoreToUser(user: UserProfile) {
    const userId = (user != null) ? user.id : null;
    this.siteService.assignToUser([this.store.site.id], userId).subscribe((sites: Site[]) => {
      this.store.site = sites[0];
      this.onStoreUpdated.emit(this.store);
    }, err => {
      this.errorService.handleServerError('Failed to update store', err,
        () => {},
        () => this.assignStoreToUser(user));
    });
  }

  openAssignmentDialog() {
    const selectAssigneeDialog = this.dialog.open(UserProfileSelectComponent);
    selectAssigneeDialog.afterClosed().subscribe(selectedUser => {
      if (selectedUser != null) {
        this.assignStoreToUser(selectedUser);
      }
    });
  }

  setFloating(floating: boolean) {
    this.storeService.getOneById(this.store.id).subscribe((store: Store) => {
      store.floating = floating;
      this.storeService.update(store).subscribe((updatedStore: Store) => {
        this.store = updatedStore;
        this.onStoreUpdated.emit(new SimplifiedStore(updatedStore));
        this.snackBar.open(`Updated Store`, null, {duration: 2000});
      }, err => {
        this.errorService.handleServerError('Failed to update store', err,
          () => {},
          () => this.setFloating(floating));
      });
    });

  }

}
