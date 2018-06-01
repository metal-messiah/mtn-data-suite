import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { UserProfileService } from '../../core/services/user-profile.service';
import { UserProfile } from '../../models/user-profile';
import { Pageable } from '../../models/pageable';

@Component({
  selector: 'mds-user-profile-select',
  templateUrl: './user-profile-select.component.html',
  styleUrls: ['./user-profile-select.component.css']
})
export class UserProfileSelectComponent implements OnInit {

  loading = false;
  error: string;
  userProfiles: UserProfile[] = [];
  latestPage: Pageable<UserProfile>;

  constructor(
    public dialogRef: MatDialogRef<ErrorDialogComponent>,
    private userProfileService: UserProfileService
  ) {
  }

  ngOnInit() {
    this.loading = true;
    this.userProfileService.getUserProfiles()
      .finally(() => this.loading = false)
      .subscribe((page: Pageable<UserProfile>) => {
        this.latestPage = page;
        this.userProfiles = page.content;
      }, error => {
        this.error = error;
      });
  }

  selectUserProfile(userProfile: UserProfile): void {
    this.dialogRef.close(userProfile);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  loadMore(): void {
    this.loading = true;
    this.userProfileService.getUserProfiles(this.latestPage.number + 1)
      .finally(() => this.loading = false)
      .subscribe((page: Pageable<UserProfile>) => {
        this.latestPage = page;
        this.userProfiles = this.userProfiles.concat(page.content);
      }, error => this.error = error);
  }

}
