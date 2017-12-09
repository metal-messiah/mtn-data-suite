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
import {PermissionSubject} from '../models/permission-subject';
import {MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.css']
})
export class RoleDetailComponent implements OnInit {

  isLoading = false;
  actionSelections: object[];
  dataSource: MatTableDataSource<PermissionSubject>;
  permissionSubjects: PermissionSubject[];
  role: Role;

  displayedColumns = ['permissionSubject', 'create', 'read', 'update', 'delete'];

  constructor(private route: ActivatedRoute,
              private roleService: RoleService,
              private permissionService: PermissionService,
              private location: Location) {
  }

  ngOnInit() {
    this.actionSelections = [
      {action: 'CREATE', selected: false},
      {action: 'READ', selected: false},
      {action: 'UPDATE', selected: false},
      {action: 'DELETE', selected: false}
    ];

    this.isLoading = true;
    this.getPermissionSubjects().subscribe(
      () => this.getRole(),
      null,
      () => this.isLoading = false
    );
  }

  getRole(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    if (id === null) {
      this.role = new Role();
    } else {
      this.roleService.getRole(id).subscribe(
        role => this.role = role
      );
    }
  }

  getPermissionSubjects(): Observable<object> {
    return this.permissionService.getPermissions()
      .do(
        pageable => this.parsePermissions(pageable['content'])
      );
  }

  private parsePermissions(permissions: Permission[]): void {
    this.permissionSubjects = [];
    _.forEach(permissions, function (permission) {
      permission.selected = false;
      let subject: PermissionSubject = _.find(this.permissionSubjects, {displayName: permission.subject});
      if (!subject) {
        subject = new PermissionSubject(permission.subject);
        this.permissionSubjects.push(subject);
      }
      _.forEach(this.actionSelections, function(actionSelection) {
        if (permission.action === actionSelection.action) {
          subject[actionSelection.action] = permission;
        }
      });
    }.bind(this));
    this.dataSource = new MatTableDataSource(_.sortBy(this.permissionSubjects, ['subject']));
  }

  selectAllForSubject(subject: PermissionSubject) {
    console.log(`Selecting All for ${subject.displayName}`);
    subject['selected'] = subject['selected'] !== true;
    _.forEach(this.actionSelections, function(actionSelection) {
      if (subject[actionSelection['action']]) {
        subject[actionSelection['action']]['selected'] = subject['selected'];
      }
    });
  }

  selectAllForAction(action: string) {
    console.log(`Selecting All for ${action}`);
    const actionSelection = _.find(this.actionSelections, {action: action});
    actionSelection['selected'] = actionSelection['selected'] !== true;
    _.forEach(this.permissionSubjects, function(permissionSubject) {
      if (permissionSubject[action]) {
        permissionSubject[action]['selected'] = actionSelection['selected'];
      }
    });
  }

  selectAllPermissions() {
    console.log(`Selecting All Permissions`);
  }

  goBack() {
    this.location.back();
  }
}
