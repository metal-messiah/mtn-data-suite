import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/full/site';
import { ShoppingCenterCasing } from '../../models/full/shopping-center-casing';
import { Store } from '../../models/full/store';
import { MatDialog, MatSnackBar } from '@angular/material';
import { UserProfileSelectComponent } from '../../shared/user-profile-select/user-profile-select.component';
import { SimplifiedUserProfile } from '../../models/simplified/simplified-user-profile';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'mds-site-overview',
  templateUrl: './site-overview.component.html',
  styleUrls: ['./site-overview.component.css']
})
export class SiteOverviewComponent implements OnInit {

  site: Site;
  selectedSCCasing: ShoppingCenterCasing;
  activeStore: Store;
  futureStore: Store;
  historicalStores: Store[];
  warningHasMultipleActiveStores = false;
  warningHasMultipleFutureStores = false;
  saving = false;

  constructor(private _location: Location,
              private router: Router,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private siteService: SiteService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    const siteId = parseInt(this.route.snapshot.paramMap.get('siteId'), 10);
    this.initSite(siteId);
  }

  initSite(siteId: number) {
    if (siteId != null) {
      console.log('getting site');
      this.siteService.getOneById(siteId).subscribe(site => {
        this.site = site;
        this.setStores(this.site.stores);
      });
    } else {
      this.site = new Site({});
    }
  }

  private setStores(stores: Store[]) {
    this.historicalStores = [];
    this.activeStore = null;
    this.futureStore = null;
    stores.forEach(store => {
      if (store.storeType === 'ACTIVE') {
        if (this.activeStore != null) {
          this.warningHasMultipleActiveStores = true;
        }
        this.activeStore = store;
      } else if (store.storeType === 'FUTURE') {
        if (this.futureStore != null) {
          this.warningHasMultipleFutureStores = true;
        }
        this.futureStore = store;
      } else {
        this.historicalStores.push(store);
      }
    });
  }

  goBack() {
    this.router.navigate(['/casing']);
  }

  openAssignmentDialog(): void {
    const selectAssigneeDialog = this.dialog.open(UserProfileSelectComponent);
    selectAssigneeDialog.afterClosed().subscribe((user: SimplifiedUserProfile) => {
      if (user != null) {
        this.assignToUser(user);
      }
    });
  }

  assignToUser(user: SimplifiedUserProfile) {
    this.saving = true;
    const previousAssignee = this.site.assignee;
    this.site.assignee = user;
    this.siteService.update(this.site).subscribe(site => {
      this.site = site;
      this.setStores(this.site.stores);
      this.openSnackBar(`Successfully updated assignment`, null, 3000);
    }, err => {
      this.site.assignee = previousAssignee;
      this.errorService.handleServerError('Failed to update assignment', err,
        () => {
        },
        () => this.assignToUser(user));
    }, () => this.saving = false);
  }

  openSnackBar(message: string, action: string, duration: number) {
    const config = {};
    if (duration != null) {
      config['duration'] = duration;
    }
    this.snackBar.open(message, action, config);
  }

  setDuplicateFlag(isDuplicate: boolean) {
    this.site.duplicate = isDuplicate;
    this.siteService.update(this.site).subscribe(site => {
      this.site = site;
      this.setStores(this.site.stores);
      this.openSnackBar(`Successfully updated site`, null, 2000);
    }, err => {
      this.site.duplicate = !this.site.duplicate;
      this.errorService.handleServerError('Failed to update site', err,
        () => {},
        () => this.setDuplicateFlag(isDuplicate));
    }, () => this.saving = false);
  }

}
