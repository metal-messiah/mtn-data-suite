import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { PermissionTableComponent } from '../permission-table/permission-table.component';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';
import { finalize } from 'rxjs/operators';
import { UserProfile } from '../../models/full/user-profile';
import { UserProfileService } from '../../core/services/user-profile.service';
import { SimplifiedPermission } from '../../models/simplified/simplified-permission';

@Component({
  selector: 'mds-user-permissions',
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.css']
})
export class UserPermissionsComponent implements OnInit {

  userProfile: UserProfile;
  userPermissions: SimplifiedPermission[];

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
    this.getUserPermissions(this.data.userProfileId);
  }

  save() {
    const permissionIds = this.permissionTable.getSelectedPermissionIds();

    this.saving = true;
    this.userProfileService.updateUserPermissions(this.data.userProfileId, permissionIds)
      .pipe(finalize(() => this.saving = false))
      .subscribe(() => {
        this.snackBar.open('Successfully updated user permissions', null, {duration: 2000});
        this.dialoRef.close();
      }, err => this.errorService.handleServerError('Failed to save permissions!', err,
        () => console.log(err), () => this.save()));
  }

  private getUserPermissions(userId: number) {
    this.userProfileService.getUserPermissions(userId)
      .subscribe(permissions => this.userPermissions = permissions,
        err => this.errorService.handleServerError('Failed to get user\'s permissions!', err,
          () => this.dialoRef.close(), () => this.getUserPermissions(userId)));
  }

  private getUserProfile() {
    this.userProfileService.getOneById(this.data.userProfileId)
      .subscribe(userProfile => this.userProfile = userProfile,
        err => this.errorService.handleServerError('Failed to get UserProfile!', err,
          () => this.dialoRef.close(), () => this.getUserProfile())
      );
  }

}
