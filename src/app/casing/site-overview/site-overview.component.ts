import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/site';
import { ShoppingCenterCasing } from '../../models/shopping-center-casing';
import { Store } from '../../models/store';
import { MatDialog, MatSnackBar } from '@angular/material';
import { UserProfileSelectComponent } from '../../shared/user-profile-select/user-profile-select.component';
import { SimplifiedUserProfile } from '../../models/simplified-user-profile';

@Component({
  selector: 'mds-site-overview',
  templateUrl: './site-overview.component.html',
  styleUrls: ['./site-overview.component.css']
})
export class SiteOverviewComponent implements OnInit {

  siteId: number;
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
              private siteService: SiteService) {
  }

  ngOnInit() {
    this.siteId = parseInt(this.route.snapshot.paramMap.get('siteId'), 10);
    this.siteService.getOneById(this.siteId).subscribe(site => {
      this.initSite(site);
    });
  }

  private initSite(site: Site) {
    this.site = site;
    console.log(site);
    this.historicalStores = [];
    this.site.stores.forEach(store => {
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

  assignToAnalyst(): void {
    const selectAssigneeDialog = this.dialog.open(UserProfileSelectComponent);
    const previousAssignee = this.site.assignee;
    selectAssigneeDialog.afterClosed().subscribe(result => {
      if (result == null) {
        console.log('Select User Dialog Closed');
      } else {
        this.saving = true;
        this.site.assignee = (result === 'unassign' ? null : result);
        this.siteService.update(this.site).subscribe(site => {
          this.initSite(site);
          if (site.assignee != null) {
            this.openSnackBar(`Successfully Assigned to ${site.assignee.email}`, null, 3000);
          } else {
            this.openSnackBar('Successfully unassigned', null, 3000);
          }
        }, err => {
          console.log(err);
          this.site.assignee = previousAssignee;
          this.openSnackBar(err.error.message, 'Acknowledge', null);
        }, () => this.saving = false );
      }
    });
  }

  openSnackBar(message: string, action: string, duration: number) {
    const config = {};
    if (duration != null) {
      config['duration'] = duration;
    }
    this.snackBar.open(message, action, config);
  }

}
