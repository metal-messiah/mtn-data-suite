import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { PermissionTableComponent } from '../permission-table/permission-table.component';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';
import { finalize } from 'rxjs/operators';
import { UserProfile } from '../../models/full/user-profile';
import { UserProfileService } from '../../core/services/user-profile.service';

@Component({
  selector: 'mds-user-permissions',
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.css']
})
export class UserPermissionsComponent implements OnInit {

  userProfile: UserProfile;

  saving = false;

  @ViewChild('permissionsTable', {static: false}) permissionTable: PermissionTableComponent;

  constructor(private userProfileService: UserProfileService,
              private snackBar: MatSnackBar,
              private errorService: ErrorService,
              private dialoRef: MatDialogRef<UserPermissionsComponent>,
              @Inject(MAT_DIALOG_DATA) private data: { userProfileId: number }) {
  }

  ngOnInit() {
    this.getUserProfile();
  }

  save() {
    const permissionIds = this.permissionTable.getSelectedPermissionIds();

    this.saving = true;
    this.userProfileService.updateUserPermissions(this.userProfile.id, permissionIds)
      .pipe(finalize(() => this.saving = false))
      .subscribe(() => {
        this.snackBar.open('Successfully updated user permissions', null, {duration: 2000});
        this.dialoRef.close();
      }, err => this.errorService.handleServerError('Failed to save permissions!', err,
        () => console.log(err), () => this.save()));
  }

  private getUserProfile() {
    this.userProfileService.getOneById(this.data.userProfileId)
      .subscribe(userProfile => this.userProfile = userProfile,
        err => this.errorService.handleServerError('Failed to get UserProfile!', err,
          () => this.dialoRef.close(), () => this.getUserProfile())
      );
  }
}
