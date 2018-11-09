import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';
import { SiteService } from '../../core/services/site.service';
import { StoreService } from '../../core/services/store.service';
import { SimplifiedSite } from '../../models/simplified/simplified-site';
import { UserProfile } from '../../models/full/user-profile';
import { Router } from '@angular/router';
import { UserProfileSelectComponent } from '../user-profile-select/user-profile-select.component';
import { Entity } from '../../models/entity';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'mds-site-info-card',
  templateUrl: './site-info-card.component.html',
  styleUrls: ['./site-info-card.component.css']
})
export class SiteInfoCardComponent implements OnInit {

  @Input() site: SimplifiedSite;

  @Input() disableActions: boolean;

  @Output() onUpdate = new EventEmitter<Entity>();
  @Output() initiateMove = new EventEmitter<Entity>();
  @Output() initiateDuplicateSelection = new EventEmitter<Entity>();

  constructor(public siteService: SiteService,
              public storeService: StoreService,
              protected errorService: ErrorService,
              protected router: Router,
              protected snackBar: MatSnackBar,
              protected authService: AuthService,
              protected dialog: MatDialog) {
  }

  ngOnInit() {
  }

  moveSite() {
    this.initiateMove.emit(this.site);
  }

  goToSiteOverview(): void {
    this.router.navigate(['casing/site', this.site.id]);
  }

  setDuplicateFlag(isDuplicate: boolean) {
    // Get full site
    return this.siteService.updateIsDuplicate(this.site.id, isDuplicate)
      .subscribe((site: SimplifiedSite) => {
        this.site = site;
        this.snackBar.open('Successfully updated Site', null, {duration: 1000});
        this.emitChanges();
      }, err => this.errorService.handleServerError('Failed to update Site!', err,
        () => {
        },
        () => this.setDuplicateFlag(isDuplicate)
      ));
  }

  pinLocation(): void {
    // TODO create the location data to the device
  }

  assignToSelf() {
    this.assign(this.authService.sessionUser.id);
  }

  assignToUser(user: UserProfile) {
    this.assign((user != null) ? user.id : null);
  }

  private assign(userId: number) {
    return this.siteService.assignToUser([this.site.id], userId)
      .subscribe((sites: SimplifiedSite[]) => {
        this.site = sites[0];
        this.snackBar.open('Successfully assigned Site', null, {duration: 1000});
        this.emitChanges();
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

  emitChanges() {
    this.onUpdate.emit(this.site);
  }

  selectDuplicateSite() {
    this.initiateDuplicateSelection.emit(this.site);
  }

}
