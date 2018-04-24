import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {DatePipe} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import 'rxjs/Rx';
import * as _ from 'lodash';
import {Observable} from 'rxjs/Observable';

import {Role} from '../../models/role';
import {Permission} from '../../models/permission';
import {UserProfile} from '../../models/user-profile';
import {DetailFormComponent} from '../../interfaces/detail-form-component';

import {ErrorService} from '../../core/services/error.service';
import {RoleService} from '../../core/services/role.service';
import {PermissionService} from '../../core/services/permission.service';
import {CanComponentDeactivate} from '../../core/services/can-deactivate.guard';
import {DetailFormService} from '../../core/services/detail-form.service';
import { SimplifiedRole } from 'app/models/simplified-role';

@Component({
  selector: 'mds-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.css']
})
export class RoleDetailComponent implements OnInit, CanComponentDeactivate, DetailFormComponent<Role> {

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
              private fb: FormBuilder,
              private datePipe: DatePipe,
              private breakpointObserver: BreakpointObserver,
              private detailFormService: DetailFormService<Role, SimplifiedRole>) {
    breakpointObserver.observe([
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      this.abbreviate = result.matches;
    });
  }

  ngOnInit() {
    this.createForm();

    this.isLoading = true;

    this.permissionService.getPermissions().subscribe(
      pageable => {
        this.parsePermissions(pageable['content']);
        this.detailFormService.retrieveObj(this);
      },
      err => this.errorService.handleServerError(
        'Failed to retrieve permissions!',
        err,
        () => this.goBack()),
      () => this.isLoading = false
    );
  }

  // Implementations for DetailFormComponent
  createForm() {
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
    this.setDisabledFields();
  }

  setDisabledFields(): void {
    this.roleForm.get('createdBy').disable();
    this.roleForm.get('createdDate').disable();
    this.roleForm.get('updatedBy').disable();
    this.roleForm.get('updatedDate').disable();
  }

  getForm(): FormGroup {
    return this.roleForm;
  }

  getNewObj(): Role {
    return new Role({});
  }

  getObj(): Role {
    return this.role;
  }

  getEntityService(): RoleService {
    return this.roleService;
  }

  getRoute(): ActivatedRoute {
    return this.route;
  }

  getSavableObj(): Role {
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

    return new Role({
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
    });
  }

  getTypeName(): string {
    return 'role';
  }

  goBack() {
    this.router.navigate(['/admin/roles']);
  }

  onObjectChange(): void {
    this.roleForm.reset({
      displayName: this.role.displayName,
      description: this.role.description
    });

    const memberFGs = this.role.members.map(member => this.fb.group(member));
    const memberFormArray = this.fb.array(memberFGs);
    this.roleForm.setControl('members', memberFormArray);

    if (this.role.id !== undefined) {
      this.roleForm.patchValue({
        createdBy: this.role.createdBy.email,
        createdDate: this.datePipe.transform(this.role.createdDate, 'medium'),
        updatedBy: this.role.updatedBy.email,
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

  setObj(obj: Role) {
    this.role = obj;
    this.onObjectChange();
  }

  // Delegated functions
  saveRole() {
    this.detailFormService.save(this);
  }

  canDeactivate(): Observable<boolean> | boolean {
    return this.detailFormService.canDeactivate(this);
  }

  // Functions Specific for Role Detail
  getPermission(subject: string, action: string) {
    return this.roleForm.get(`permissions.${subject}.${action}`);
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

  updateAllControls(subject, action) {
    this.updateSubjectControls(subject);
    this.updateActionControls(action);
    this.updateAllSelected();
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

  private updateActionControls(action) {
    const actionPermissions = _.filter(this.permissions, {action: action});
    const every = _.every(actionPermissions, permission => {
      return permission['control'].value;
    });
    this.roleForm.get(`actions.${action}`).setValue(every);
  }

  private updateAllSelected() {
    const every = _.every(this.permissions, permission => {
      return permission['control'].value;
    });
    this.roleForm.patchValue({'allSelected': every});
  }

  private updateSubjectControls(subject) {
    const subjectPermissions = _.filter(this.permissions, {subject: subject});
    this.roleForm.get(`subjects.${subject}`).setValue(_.every(subjectPermissions, permission => {
      return permission['control'].value;
    }));
  }

}
