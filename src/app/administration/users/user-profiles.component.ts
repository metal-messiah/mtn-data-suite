import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfile } from '../../models/full/user-profile';
import { ErrorService } from '../../core/services/error.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { Pageable } from '../../models/pageable';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/internal/operators';
import { MatDialog, MatSnackBar, Sort } from '@angular/material';
import { ItemSelectionDialogComponent } from '../../shared/item-selection/item-selection-dialog.component';
import { GroupService } from '../../core/services/group.service';
import { RoleService } from '../../core/services/role.service';
import { CompareUtil } from '../../utils/compare-util';

@Component({
  selector: 'mds-users',
  templateUrl: './user-profiles.component.html',
  styleUrls: ['./user-profiles.component.css', '../list-view.css']
})
export class UserProfilesComponent implements OnInit {

  userProfiles: UserProfile[];

  isLoading = false;
  isSaving = false;

  latestPage: Pageable<UserProfile>;

  constructor(private userProfileService: UserProfileService,
              private router: Router,
              private groupService: GroupService,
              private roleService: RoleService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private _location: Location,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.getUsers();
  }

  getUsers(): void {
    this.isLoading = true;
    this.userProfileService.getUserProfiles()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(page => {
          this.latestPage = page;
          this.userProfiles = page.content;
        },
        err => this.errorService.handleServerError(`Failed to retrieve User Profiles`, err,
          () => this.goBack(),
          () => this.getUsers())
      );
  }

  goBack() {
    this._location.back();
  }

  sortData(sort: Sort) {
    if (sort.active === 'group') {
      this.userProfiles.sort((a, b) => {
        const aName = a.group ? a.group.displayName : null;
        const bName = b.group ? b.group.displayName : null;
        return CompareUtil.compareStrings(aName, bName, sort.direction === 'desc');
      });
    } else if (sort.active === 'role') {
      this.userProfiles.sort((a, b) => {
        const aName = a.role ? a.role.displayName : null;
        const bName = b.role ? b.role.displayName : null;
        return CompareUtil.compareStrings(aName, bName, sort.direction === 'desc');
      });
    } else if (sort.direction !== '') {
      this.userProfiles.sort((a, b) =>
        CompareUtil.compareStrings(a[sort.active], b[sort.active], sort.direction === 'desc'));
    } else {
      this.userProfiles.sort((a, b) => a.id - b.id);
    }
  }

  selectRole($event, userProfile) {
    $event.stopPropagation();

    this.roleService.getAllRoles().subscribe(page => {
      const data = {
        prompt: 'Select Role',
        items: page.content,
        getDisplayText: role => role.displayName
      };
      this.dialog.open(ItemSelectionDialogComponent, {data: data}).afterClosed().subscribe(result => {
        if (result) {
          this.setUserRole(userProfile, result.itemId);
        }
      });
    });
  }

  selectGroup($event, userProfile) {
    $event.stopPropagation();
    this.groupService.getAllGroups().subscribe(page => {
      const data = {
        prompt: 'Select Group',
        items: page.content,
        getDisplayText: group => group.displayName
      };
      this.dialog.open(ItemSelectionDialogComponent, {data: data}).afterClosed().subscribe(result => {
        if (result) {
          this.setUserGroup(userProfile, result.itemId);
        }
      });
    });
  }

  private setUserRole(userProfile: UserProfile, roleId: number) {
    this.isSaving = true;
    this.userProfileService.setUserRole(userProfile.id, roleId)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe(up => {
          userProfile.role = up.role;
          this.snackBar.open('Successfully updated users role', null, {duration: 2000});
        },
        error1 => this.errorService.handleServerError('Failed to set user\'s role!', error1, null,
          () => this.setUserGroup(userProfile, roleId)));

  }

  private setUserGroup(userProfile: UserProfile, groupId: number) {
    this.isSaving = true;
    this.userProfileService.setUserGroup(userProfile.id, groupId)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe(up => {
          userProfile.group = up.group;
          this.snackBar.open('Successfully updated users group', null, {duration: 2000});
        },
        error1 => this.errorService.handleServerError('Failed to set user\'s group!', error1, null,
          () => this.setUserGroup(userProfile, groupId)));

  }

}
