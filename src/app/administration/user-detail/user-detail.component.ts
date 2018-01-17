import {Component, OnInit} from '@angular/core';
import {DatePipe, Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';

import {UserProfile} from '../../models/user-profile';
import {Role} from '../../models/role';
import {Group} from '../../models/group';

import {UserService} from '../../core/services/user.service';
import {RoleService} from '../../core/services/role.service';
import {GroupService} from '../../core/services/group.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ErrorService} from '../../core/services/error.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ConfirmDialogComponent} from '../../shared/confirm-dialog/confirm-dialog.component';
import {Observable} from 'rxjs/Observable';
import {CanComponentDeactivate} from '../../core/services/can-deactivate.guard';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit, CanComponentDeactivate {

  userForm: FormGroup;

  user: UserProfile;
  roles: Role[];
  groups: Group[];

  isSaving = false;
  isLoading = false;

  constructor(private userService: UserService,
              private roleService: RoleService,
              private groupService: GroupService,
              private route: ActivatedRoute,
              private router: Router,
              private errorService: ErrorService,
              private snackBar: MatSnackBar,
              private fb: FormBuilder,
              private datePipe: DatePipe,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.createForm();

    this.isLoading = true;

    Observable.zip(
      this.roleService.getRoles(),
      this.groupService.getGroups()
    ).subscribe(
      pair => {
        const compareDisplayNames = function(object1, object2) {
          return object1['displayName'].localeCompare(object2['displayName']);
        };
        this.roles = pair[0].content.sort(compareDisplayNames);
        this.groups = pair[1].content.sort(compareDisplayNames);
        this.getUser();
      },
      err => this.errorService.handleServerError(
        'Failed to retrieve reference values! (Groups and Roles)', err,
        () => this.goBack()),
      () => this.isLoading = false
    );
  }

  goBack() {
    this.goToUsers();
  }

  saveUser() {
    this.isSaving = true;
    this.userForm.disable();
    const reenable = () => {
      this.isSaving = false;
      this.userForm.enable();
    };
    this.userService.saveUser(this.getUpdatedUserProfile()).subscribe(
      user => {
        this.snackBar.open('Successfully saved user!', null, {duration: 2000});
        this.userForm.reset();
        this.goToUsers();
      },
      err => this.errorService.handleServerError('Failed to save user profile!', err, reenable, this.saveUser),
      reenable
    );
  }

  private goToUsers() {
    this.router.navigate(['/admin/users']);
  }

  private createForm() {
    this.userForm = this.fb.group({
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
    this.userForm.get('createdBy').disable();
    this.userForm.get('createdDate').disable();
    this.userForm.get('updatedBy').disable();
    this.userForm.get('updatedDate').disable();
  }

  private getUser(): void {
    this.isLoading = true;
    const id = +this.route.snapshot.paramMap.get('id');
    if (id === null || id < 1) {
      this.user = new UserProfile();
      this.onUserProfileChange();
      this.isLoading = false;
    } else {
      this.userService.getUserProfile(id).subscribe(
        user => {
          this.user = user;
          this.onUserProfileChange();
        },
        err => this.errorService.handleServerError(
          'Failed to retrieve user profile!', err,
          () => this.goBack()),
        () => this.isLoading = false
      );
    }
  }

  private onUserProfileChange() {
    this.userForm.reset({
      email: this.user.email,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      group: this.user.group,
      role: this.user.role
    });

    if (this.user.id !== undefined) {
      this.userForm.patchValue({
        createdBy: `${this.user.createdBy.firstName} ${this.user.createdBy.lastName}`,
        createdDate: this.datePipe.transform(this.user.createdDate, 'medium'),
        updatedBy: `${this.user.updatedBy.firstName} ${this.user.updatedBy.lastName}`,
        updatedDate: this.datePipe.transform(this.user.updatedDate, 'medium'),
      });
    }
  }

  private getUpdatedUserProfile(): UserProfile {
    const formModel = this.userForm.value;

    const updatedUserProfile: UserProfile = {
      id: this.user.id,
      email: formModel.email,
      firstName: formModel.firstName,
      lastName: formModel.lastName,
      group: formModel.group,
      role: formModel.role,
      createdBy: this.user.createdBy,
      createdDate: this.user.createdDate,
      updatedBy: this.user.updatedBy,
      updatedDate: this.user.updatedDate,
      version: this.user.version
    };

    return updatedUserProfile;
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.userForm.pristine) {
      return true;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {title: 'Warning!', question: 'Are you sure you wish to abandon unsaved changes?'}
    });
    return dialogRef.afterClosed();
  }

  compareFn(u1: UserProfile, u2: UserProfile): boolean {
    return u1 && u2 ? u1.id === u2.id : u1 === u2;
  }
}
