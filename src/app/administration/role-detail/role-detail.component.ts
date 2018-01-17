import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {DatePipe} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import 'rxjs/Rx';
import * as _ from 'lodash';

import {Role} from '../../models/role';
import {Permission} from '../../models/permission';
import {UserProfile} from '../../models/user-profile';

import {ErrorService} from '../../core/services/error.service';
import {RoleService} from '../../core/services/role.service';
import {PermissionService} from '../../core/services/permission.service';

import {ConfirmDialogComponent} from '../../shared/confirm-dialog/confirm-dialog.component';
import {CanComponentDeactivate} from '../../core/services/can-deactivate.guard';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.css']
})
export class RoleDetailComponent implements OnInit, CanComponentDeactivate {

  roleForm: FormGroup;

  role: Role;

  permissions: Permission[];
  actions: string[] = [];
  subjects: string[] = [];

  abbreviate = false;
  isSaving = false;
  isLoading = false;

  constructor(private roleService: RoleService,
              private permissionService: PermissionService,
              private route: ActivatedRoute,
              private router: Router,
              private errorService: ErrorService,
              private snackBar: MatSnackBar,
              private fb: FormBuilder,
              private datePipe: DatePipe,
              private dialog: MatDialog,
              private breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      this.abbreviate = result.matches;
    });

    router.events.subscribe((val) => {
      if (val instanceof NavigationStart) {
      }
    });
  }

  ngOnInit() {
    this.createForm();

    this.isLoading = true;

    this.permissionService.getPermissions().subscribe(
      pageable => {
        this.parsePermissions(pageable['content']);
        this.getRole();
      },
      err => this.errorService.handleServerError(
        'Failed to retrieve permissions!',
        err,
        () => this.goBack()),
      () => this.isLoading = false
    );
  }

  getPermission(subject: string, action: string) {
    return this.roleForm.get(`permissions.${subject}.${action}`);
  }

  toggleSubject(subject: string) {
    const subjectPermissions = _.filter(this.permissions, {subject: subject});
    _.forEach(subjectPermissions, permission => {
      permission['control'].setValue(this.roleForm.get(`subjects.${subject}`).value);
    });
    _.forEach(this.actions, action => {
      this.updateActionControls(action);
    });
    this.updateAllSelected();
  }

  toggleAction(action: string) {
    const actionPermissions = _.filter(this.permissions, {action: action});
    _.forEach(actionPermissions, permission => {
      permission['control'].setValue(this.roleForm.get(`actions.${action}`).value);
    });
    _.forEach(this.subjects, subject => {
      this.updateSubjectControls(subject);
    });
    this.updateAllSelected();
  }

  selectAllPermissions() {
    const val = this.roleForm.get('allSelected').value;
    _.forEach(this.permissions, permission => {
      permission['control'].setValue(val);
    });

    _.forEach(this.actions, action => {
      this.roleForm.get(`actions.${action}`).setValue(val);
    });
    _.forEach(this.subjects, subject => {
      this.roleForm.get(`subjects.${subject}`).setValue(val);
    });
  }

  updateAllControls(subject, action) {
    this.updateSubjectControls(subject);
    this.updateActionControls(action);
    this.updateAllSelected();
  }

  goBack() {
    this.goToRoles();
  }

  saveRole() {
    this.isSaving = true;
    this.roleForm.disable();
    const reenable = () => {
      this.isSaving = false;
      this.roleForm.enable();
    };
    this.roleService.saveRole(this.getUpdatedRole()).subscribe(
      role => {
        this.snackBar.open('Successfully saved role!', null, {duration: 2000});
        this.role = role;
        this.onRoleChange();
        this.goToRoles();
      },
      err => this.errorService.handleServerError('Failed to save role!', err, reenable, this.saveRole),
      reenable
    );
  }

  private goToRoles() {
    this.router.navigate(['/admin/roles']);
  }

  private updateActionControls(action) {
    const actionPermissions = _.filter(this.permissions, {action: action});
    const every = _.every(actionPermissions, permission => {
      return permission['control'].value;
    });
    this.roleForm.get(`actions.${action}`).setValue(every);
  }

  private updateSubjectControls(subject) {
    const subjectPermissions = _.filter(this.permissions, {subject: subject});
    this.roleForm.get(`subjects.${subject}`).setValue(_.every(subjectPermissions, permission => {
      return permission['control'].value;
    }));
  }

  private createForm() {
    this.roleForm = this.fb.group({
      displayName: ['', Validators.required],
      description: '',
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: '',
      members: this.fb.array([]),
      allSelected: true
    });
    this.roleForm.get('createdBy').disable();
    this.roleForm.get('createdDate').disable();
    this.roleForm.get('updatedBy').disable();
    this.roleForm.get('updatedDate').disable();
  }

  private getRole(): void {
    this.isLoading = true;
    const id = +this.route.snapshot.paramMap.get('id');
    if (id === null || id < 1) {
      this.role = new Role();
      this.onRoleChange();
      this.isLoading = false;
    } else {
      this.roleService.getRole(id).subscribe(
        role => {
          this.role = role;
          this.onRoleChange();
        },
        err => this.errorService.handleServerError('Failed to retrieve role!', err,
          () => this.goBack()),
        () => this.isLoading = false
      );
    }
  }

  private onRoleChange() {
    this.roleForm.reset({
      displayName: this.role.displayName,
      description: this.role.description
    });

    const memberFGs = this.role.members.map(member => this.fb.group(member));
    const memberFormArray = this.fb.array(memberFGs);
    this.roleForm.setControl('members', memberFormArray);

    if (this.role.id !== undefined) {
      this.roleForm.patchValue({
        createdBy: `${this.role.createdBy.firstName} ${this.role.createdBy.lastName}`,
        createdDate: this.datePipe.transform(this.role.createdDate, 'medium'),
        updatedBy: `${this.role.updatedBy.firstName} ${this.role.updatedBy.lastName}`,
        updatedDate: this.datePipe.transform(this.role.updatedDate, 'medium'),
      });
    }

    _.forEach(this.role.permissions, function (permission) {
      this.roleForm.get(`permissions.${permission.subject}.${permission.action}`).setValue(true);
    }.bind(this));

    _.forEach(this.subjects, subject => {
      this.updateSubjectControls(subject);
    });
    _.forEach(this.actions, action => {
      this.updateActionControls(action);
    });

    this.updateAllSelected();
  }

  private updateAllSelected() {
    const every = _.every(this.permissions, permission => {
      return permission['control'].value;
    });
    this.roleForm.patchValue({'allSelected': every});
  }

  private parsePermissions(permissions: Permission[]): void {
    this.permissions = permissions;
    const permissionControls = this.fb.group({});

    this.subjects = _.chain(permissions).map('subject').uniq().sort().value();
    const subjectControls = this.fb.group({});
    this.roleForm.addControl('subjects', subjectControls);
    _.forEach(this.subjects, subject => {
      subjectControls.addControl(subject, this.fb.control(false));
      permissionControls.addControl(subject, this.fb.group({}));
    });

    this.actions = _.chain(permissions).map('action').uniq().sort().value();
    const actionControls = this.fb.group({});
    this.roleForm.addControl('actions', actionControls);
    _.forEach(this.actions, action => {
      actionControls.addControl(action, this.fb.control(false));
    });

    this.roleForm.addControl('permissions', permissionControls);
    _.forEach(permissions, permission => {
      const permissionControl = this.fb.control(false);
      permission['control'] = permissionControl;
      (permissionControls.get(permission.subject) as FormGroup).addControl(permission.action, permissionControl);
    });
  }

  private getUpdatedRole(): Role {
    const formModel = this.roleForm.value;

    const selectedPermissions = _.filter(this.permissions, permission => {
      return permission['control'].value === true;
    });
    const permissionsDeepCopy: Permission[] = selectedPermissions.map(
      (permission: Permission) => {
        const p = Object.assign({}, permission);
        p['control'] = undefined;
        return p;
      }
    );

    // deep copy of members
    const membersDeepCopy: UserProfile[] = formModel.members.map(
      (member: UserProfile) => Object.assign({}, member)
    );

    const updatedRole: Role = {
      id: this.role.id,
      displayName: formModel.displayName,
      description: formModel.description,
      members: membersDeepCopy,
      permissions: permissionsDeepCopy,
      createdBy: this.role.createdBy,
      createdDate: this.role.createdDate,
      updatedBy: this.role.updatedBy,
      updatedDate: this.role.updatedDate,
      version: this.role.version
    };

    return updatedRole;
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.roleForm.pristine) {
      return true;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {title: 'Warning!', question: 'Are you sure you wish to abandon unsaved changes?'}
    });
    return dialogRef.afterClosed();
  }
}
