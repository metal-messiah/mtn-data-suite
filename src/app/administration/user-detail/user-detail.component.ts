import {Component, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';

import {UserProfile} from '../../models/user-profile';
import {Role} from '../../models/role';
import {Group} from '../../models/group';

import {UserProfileService} from '../../core/services/user.service';
import {RoleService} from '../../core/services/role.service';
import {GroupService} from '../../core/services/group.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ErrorService} from '../../core/services/error.service';
import {Observable} from 'rxjs/Observable';
import {CanComponentDeactivate} from '../../core/services/can-deactivate.guard';
import {DetailFormComponent} from '../../interfaces/detail-form-component';
import {DetailFormService} from '../../core/services/detail-form.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit, CanComponentDeactivate, DetailFormComponent<UserProfile> {

  userProfileForm: FormGroup;

  userProfile: UserProfile;

  roles: Role[];
  groups: Group[];

  isSaving = false;
  isLoading = false;

  constructor(private userProfileService: UserProfileService,
              private roleService: RoleService,
              private groupService: GroupService,
              private route: ActivatedRoute,
              private router: Router,
              private errorService: ErrorService,
              private fb: FormBuilder,
              private datePipe: DatePipe,
              private detailFormService: DetailFormService<UserProfile>) {
  }

  ngOnInit() {
    this.createForm();

    this.isLoading = true;

    Observable.zip(
      this.roleService.getAll(),
      this.groupService.getAll()
    ).subscribe(
      pair => {
        const compareDisplayNames = function(object1, object2) {
          return object1['displayName'].localeCompare(object2['displayName']);
        };
        this.roles = pair[0].content.sort(compareDisplayNames);
        this.groups = pair[1].content.sort(compareDisplayNames);
        this.detailFormService.retrieveObj(this);
      },
      err => this.errorService.handleServerError(
        'Failed to retrieve reference values! (Groups and Roles)', err,
        () => this.goBack()),
      () => this.isLoading = false
    );
  }

  // Implementations for DetailFormComponent
  createForm(): void {
    this.userProfileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: '',
      lastName: '',
      group: '',
      role: '',
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    });
    this.setDisabledFields();
  }

  setDisabledFields(): void {
    this.userProfileForm.get('createdBy').disable();
    this.userProfileForm.get('createdDate').disable();
    this.userProfileForm.get('updatedBy').disable();
    this.userProfileForm.get('updatedDate').disable();
  }

  getForm(): FormGroup {
    return this.userProfileForm;
  }
  getNewObj(): UserProfile {
    return new UserProfile();
  }
  getObj(): UserProfile {
    return this.userProfile;
  }
  getObjService(): UserProfileService {
    return this.userProfileService;
  }
  getRoute(): ActivatedRoute {
    return this.route;
  }
  getSavableObj(): UserProfile {
    const formModel = this.userProfileForm.value;

    const updatedUserProfile: UserProfile = {
      id: this.userProfile.id,
      email: formModel.email,
      firstName: formModel.firstName,
      lastName: formModel.lastName,
      group: formModel.group,
      role: formModel.role,
      createdBy: this.userProfile.createdBy,
      createdDate: this.userProfile.createdDate,
      updatedBy: this.userProfile.updatedBy,
      updatedDate: this.userProfile.updatedDate,
      version: this.userProfile.version
    };

    return updatedUserProfile;
  }
  getTypeName(): string {
    return 'user profile';
  }
  goBack() {
    this.router.navigate(['/admin/users']);
  }
  onObjectChange() {
    this.userProfileForm.reset({
      email: this.userProfile.email,
      firstName: this.userProfile.firstName,
      lastName: this.userProfile.lastName,
      group: this.userProfile.group,
      role: this.userProfile.role
    });

    if (this.userProfile.id !== undefined) {
      this.userProfileForm.patchValue({
        createdBy: `${this.userProfile.createdBy.firstName} ${this.userProfile.createdBy.lastName}`,
        createdDate: this.datePipe.transform(this.userProfile.createdDate, 'medium'),
        updatedBy: `${this.userProfile.updatedBy.firstName} ${this.userProfile.updatedBy.lastName}`,
        updatedDate: this.datePipe.transform(this.userProfile.updatedDate, 'medium'),
      });
    }
  }
  setObj(obj: UserProfile) {
    this.userProfile = obj;
    this.onObjectChange();
  }

  // Delegated functions
  saveUser() {
    this.detailFormService.save(this);
  }
  canDeactivate(): Observable<boolean> | boolean {
    return this.detailFormService.canDeactivate(this);
  }

  compareIds(u1, u2): boolean {
    return u1 && u2 ? u1.id === u2.id : u1 === u2;
  }
}
