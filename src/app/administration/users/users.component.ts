import {Component, OnInit} from '@angular/core';
import {UserProfileService} from '../../core/services/user.service';
import {Router} from '@angular/router';
import {UserProfile} from '../../models/user-profile';
import {BasicEntityListComponent} from '../../interfaces/basic-entity-list-component';
import {EntityListService} from '../../core/services/entity-list.service';

@Component({
  selector: 'mds-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, BasicEntityListComponent<UserProfile> {

  userProfiles: UserProfile[];

  isLoading = false;
  isDeleting = false;

  constructor(private userProfileService: UserProfileService,
              private router: Router,
              private els: EntityListService<UserProfile>) {
  }

  ngOnInit() {
    this.els.initialize(this);
  }

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

  setEntities(userProfiles: UserProfile[]): void {
    this.userProfiles = userProfiles;
  }

  sortCompare(a: UserProfile, b: UserProfile): number {
    const getVal = (obj) => obj.firstName ? obj.firstName : obj.lastName ? obj.lastName : obj.email;
    return getVal(a).localeCompare(getVal(b));
  }
}
