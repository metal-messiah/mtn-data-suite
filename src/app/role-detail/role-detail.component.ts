import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {Role} from '../models/role';
import {Permission} from '../models/permission';
import {ActivatedRoute} from '@angular/router';
import {RoleService} from '../services/role.service';
import {PermissionService} from '../services/permission.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import * as _ from 'lodash';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {MatSnackBar} from '@angular/material';
import {ErrorService} from '../services/error.service';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.css']
})
export class RoleDetailComponent implements OnInit {

  allSelected = false;
  actionControls: object;
  subjectControls: object;
  actions: string[] = [];
  subjects: string[] = [];
  permissions: Permission[];
  abbreviate = false;

  isSaving = false;
  isLoading = false;
  role: Role;

  constructor(private route: ActivatedRoute,
              private roleService: RoleService,
              private errorService: ErrorService,
              private permissionService: PermissionService,
              private location: Location,
              private snackBar: MatSnackBar,
              breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      this.abbreviate = result.matches;
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.getPermissions().subscribe(
      () => this.getRole(),
      err => this.errorService.handleServerError(
        'Failed to retrieve permissions!',
        err,
        () => this.location.back()),
      () => this.isLoading = false
    );
  }

  private getRole(): void {
    this.isLoading = true;
    const id = +this.route.snapshot.paramMap.get('id');
    if (id === null || id < 1) {
      this.initRole(new Role());
      this.isLoading = false;
    } else {
      this.roleService.getRole(id).subscribe(
        role => this.initRole(role),
        err => this.errorService.handleServerError('Failed to retrieve role!', err,
          () => this.location.back()),
        () => this.isLoading = false
      );
    }
  }

  private initRole(role: Role) {
    this.role = role;
    _.forEach(this.role.permissions, function (permission) {
      _.find(this.permissions, {id: permission.id})['selected'] = true;
      _.forEach(this.subjects, subject => {
        this.updateSubjectControls(subject);
      });
      _.forEach(this.actions, action => {
        this.updateActionControls(action);
      });
      this.allSelected = _.every(this.permissions, {selected: true});
    }.bind(this));
  }

  private getPermissions(): Observable<object> {
    return this.permissionService.getPermissions()
      .do(
        pageable => this.parsePermissions(pageable['content'])
      );
  }

  private parsePermissions(permissions: Permission[]): void {
    this.permissions = permissions;
    this.subjects = _.chain(permissions).map('subject').uniq().sort().value();
    this.actions = _.chain(permissions).map('action').uniq().sort().value();
    this.subjectControls = {};
    this.actionControls = {};
    _.forEach(this.subjects, subject => {
      this.subjectControls[subject] = false;
    });
    _.forEach(this.actions, action => {
      this.actionControls[action] = false;
    });
  }

  getPermission(subject: string, action: string) {
    return _.find(this.permissions, {subject: subject, action: action});
  }

  toggleSubject(subject: string) {
    const subjectPermissions = _.filter(this.permissions, {subject: subject});
    _.forEach(subjectPermissions, permission => {
      permission['selected'] = this.subjectControls[subject];
    });
    _.forEach(this.actions, action => {
      this.updateActionControls(action);
    });
    this.allSelected = _.every(this.permissions, {selected: true});
  }

  toggleAction(action: string) {
    const actionPermissions = _.filter(this.permissions, {action: action});
    _.forEach(actionPermissions, permission => {
      permission['selected'] = this.actionControls[action];
    });
    _.forEach(this.subjects, subject => {
      this.updateSubjectControls(subject);
    });
    this.allSelected = _.every(this.permissions, {selected: true});
  }

  selectAllPermissions() {
    _.forEach(this.actions, action => {
      this.actionControls[action] = this.allSelected;
    });
    _.forEach(this.subjects, subject => {
      this.subjectControls[subject] = this.allSelected;
    });
    _.forEach(this.permissions, permission => {
      permission['selected'] = this.allSelected;
    });
  }

  updateAllControls(subject, action) {
    this.updateSubjectControls(subject);
    this.updateActionControls(action);
    this.allSelected = _.every(this.permissions, {selected: true});
  }

  private updateActionControls(action) {
    const actionPermissions = _.filter(this.permissions, {action: action});
    this.actionControls[action] = _.every(actionPermissions, {selected: true});
  }

  private updateSubjectControls(subject) {
    const subjectPermissions = _.filter(this.permissions, {subject: subject});
    this.subjectControls[subject] = _.every(subjectPermissions, {selected: true});
  }

  cancel() {
    this.location.back();
  }

  saveRole() {
    this.isSaving = true;
    this.role.permissions = _.filter(this.permissions, {selected: true});
    this.roleService.saveRole(this.role).subscribe(
      role => {
        this.snackBar.open('Successfully saved role!', null, {duration: 2000});
        this.initRole(role);
      },
      err => this.errorService.handleServerError('Failed to save role!', err,
        () => this.isSaving = false,
        () => this.saveRole()),
      () => this.isSaving = false
    );
  }
}
