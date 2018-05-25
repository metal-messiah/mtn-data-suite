import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfile } from '../../models/user-profile';
import { BasicEntityListComponent } from '../../interfaces/basic-entity-list-component';
import { EntityListService } from '../../core/services/entity-list.service';
import { ErrorService } from '../../core/services/error.service';
import { UserProfileService } from '../../core/services/user-profile.service';

@Component({
  selector: 'mds-users',
  templateUrl: './user-profiles.component.html',
  styleUrls: ['./user-profiles.component.css']
})
export class UserProfilesComponent implements OnInit, BasicEntityListComponent<UserProfile> {

  userProfiles: UserProfile[];

  isLoading = false;
  isDeleting = false;

  constructor(private userProfileService: UserProfileService,
              private router: Router,
              private els: EntityListService<UserProfile>,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.els.initialize(this);
  }

  loadEntities(): void {
    this.userProfileService.getAllUserProfiles()
      .finally(() => this.isLoading = false)
      .subscribe(
        pageable => this.userProfiles = pageable.content.sort(this.sortCompare),
        err => this.errorService.handleServerError(`Failed to retrieve User Profiles`, err,
          () => this.goBack(),
          () => this.els.initialize(this))
      );
  };

  confirmDelete(userProfile: UserProfile) {
    this.els.confirmDelete(this, userProfile);
  }

  goBack() {
    this.router.navigate(['admin']);
  }

  getPluralTypeName(): string {
    return 'user profiles';
  }

  getEntityService(): UserProfileService {
    return this.userProfileService;
  }

  getTypeName(): string {
    return 'user profile';
  }

  sortCompare(a: UserProfile, b: UserProfile): number {
    const getVal = (obj) => obj.firstName ? obj.firstName : obj.lastName ? obj.lastName : obj.email;
    return getVal(a).localeCompare(getVal(b));
  }
}
