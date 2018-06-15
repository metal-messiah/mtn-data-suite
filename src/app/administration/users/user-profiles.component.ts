import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfile } from '../../models/full/user-profile';
import { BasicEntityListComponent } from '../../interfaces/basic-entity-list-component';
import { EntityListService } from '../../core/services/entity-list.service';
import { ErrorService } from '../../core/services/error.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { Pageable } from '../../models/pageable';

@Component({
  selector: 'mds-users',
  templateUrl: './user-profiles.component.html',
  styleUrls: ['./user-profiles.component.css']
})
export class UserProfilesComponent implements OnInit, BasicEntityListComponent<UserProfile> {

  userProfiles: UserProfile[];

  isLoading = false;
  isDeleting = false;

  latestPage: Pageable<UserProfile>;

  constructor(private userProfileService: UserProfileService,
              private router: Router,
              private els: EntityListService<UserProfile>,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.els.initialize(this);
  }

  loadEntities(): void {
    this.userProfileService.getUserProfiles()
      .finally(() => this.isLoading = false)
      .subscribe(
        page => {
          this.latestPage = page;
          this.userProfiles = page.content;
        },
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

  loadMore(): void {
    this.isLoading = true;
    this.userProfileService.getUserProfiles(this.latestPage.number + 1)
      .finally(() => this.isLoading = false)
      .subscribe((page: Pageable<UserProfile>) => {
        this.latestPage = page;
        this.userProfiles = this.userProfiles.concat(page.content);
      }, error => this.errorService.handleServerError('Failed to get Users', error,
        () => this.goBack(),
        () => this.loadMore()));
  }
}
