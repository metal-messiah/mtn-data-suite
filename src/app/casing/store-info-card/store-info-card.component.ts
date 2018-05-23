import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '../../models/store';
import { Router } from '@angular/router';
import { CasingDashboardMode } from '../casing-dashboard/casing-dashboard.component';
import { SiteService } from '../../core/services/site.service';
import { ErrorService } from '../../core/services/error.service';
import { Site } from '../../models/site';
import { UserProfileSelectComponent } from '../../shared/user-profile-select/user-profile-select.component';
import { MatDialog } from '@angular/material';
import { UserProfile } from '../../models/user-profile';

@Component({
  selector: 'mds-store-info-card',
  templateUrl: './store-info-card.component.html',
  styleUrls: ['./store-info-card.component.css']
})
export class StoreInfoCardComponent implements OnInit {

  @Input() store: Store;
  @Input() disableActions: boolean;

  @Output() onStoreEdited = new EventEmitter<Store>();
  @Output() onMoveStore = new EventEmitter<Store>();

  constructor(private router: Router,
              private siteService: SiteService,
              private errorService: ErrorService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
  }

  goToSiteOverview(): void {
    this.router.navigate(['casing/site-overview', this.store.site.id]);
  }

  pinLocation(): void {
    // TODO create the location data to the device
  }

  setDuplicateFlag(isDuplicate: boolean)  {
    // Get full site
    this.siteService.getOneById(this.store.site.id).subscribe(site => {
      site.duplicate = isDuplicate;
      this.siteService.update(site).subscribe(s => {
        this.store.site = s;
        this.onStoreEdited.emit(this.store);
      }, err => {
        site.duplicate = !site.duplicate;
        this.errorService.handleServerError('Failed to update store', err,
          () => {},
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
      this.onStoreEdited.emit(this.store);
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

}
