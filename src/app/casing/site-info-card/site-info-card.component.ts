import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';
import { SiteService } from '../../core/services/site.service';
import { StoreService } from '../../core/services/store.service';
import { SimplifiedSite } from '../../models/simplified/simplified-site';
import { Site } from '../../models/full/site';
import { UserProfile } from '../../models/full/user-profile';
import { Router } from '@angular/router';
import { UserProfileSelectComponent } from '../../shared/user-profile-select/user-profile-select.component';
import { Entity } from '../../models/entity';
import { map, mergeMap, tap } from 'rxjs/internal/operators';
import { Observable } from 'rxjs/index';

@Component({
  selector: 'mds-site-info-card',
  templateUrl: './site-info-card.component.html',
  styleUrls: ['./site-info-card.component.css']
})
export class SiteInfoCardComponent implements OnInit {

  @Input() site: SimplifiedSite | Site;

  @Input() disableActions: boolean;

  @Output() onUpdate = new EventEmitter<Entity>();
  @Output() initiateMove = new EventEmitter<Entity>();

  constructor(public siteService: SiteService,
              public storeService: StoreService,
              protected errorService: ErrorService,
              protected router: Router,
              protected snackBar: MatSnackBar,
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
    return this.siteService.getOneById(this.site.id)
      .pipe(mergeMap((site: Site) => {
        site.duplicate = isDuplicate;
        return this.updateSite(site);
      }))
      .subscribe((site: Site) => {
        this.site = site;
        this.snackBar.open('Successfully updated Site', null, {duration: 1000});
        this.emitChanges();
      }, err => this.errorService.handleServerError('Failed to update Site!', err,
        () => {
        },
        () => this.setDuplicateFlag(isDuplicate)
      ));
  }

  private updateSite(siteWithUpdates: Site): Observable<Site> {
    return this.siteService.update(siteWithUpdates)
      .pipe(tap((site: Site) => {
        this.site = site;
        return this.site;
      }, err => {
        this.errorService.handleServerError('Failed to update store', err,
          () => {
          },
          () => this.updateSite(siteWithUpdates));
      }));
  }

  pinLocation(): void {
    // TODO create the location data to the device
  }

  assignToUser(user: UserProfile) {
    const userId = (user != null) ? user.id : null;
    return this.siteService.assignToUser([this.site.id], userId)
      .pipe(map((sites: Site[]) => {
          this.site = sites[0];
          return this.site;
        }, err => this.errorService.handleServerError('Failed to update store', err,
        () => console.log('Cancelled'),
        () => this.assignToUser(user))
      ))
      .subscribe((site: Site) => {
        this.site = site;
        this.snackBar.open('Successfully assigned Site', null, {duration: 1000});
        this.emitChanges();
      });
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

}
