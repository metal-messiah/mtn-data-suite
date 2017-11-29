import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {Role} from '../models/role';
import {Permission} from '../models/permission';
import {ActivatedRoute} from '@angular/router';
import {RoleService} from '../services/role.service';
import {PermissionService} from '../services/permission.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.css']
})
export class RoleDetailComponent implements OnInit {

  role: Role;
  permissions: Permission[];

  constructor(private route: ActivatedRoute,
              private roleService: RoleService,
              private permissionService: PermissionService,
              private location: Location) {
  }

  ngOnInit() {
    this.getRole();
    this.getPermissions();
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

  getPermissions(): void {
    this.permissionService.getPermissions()
      .subscribe(
        pageable => this.parsePermissions(pageable['content'])
      );
  }

  private parsePermissions(permissions: Permission[]): void {
    this.permissions = permissions;
    const permissionMap = {};
    Observable.from(this.permissions)
      .groupBy(permission => permission.subject)
      .flatMap(group =>
        group.reduce(
          (acc, curr) => [...acc, curr['action']], []))
      .subscribe(val => permissionMap[val[0]['subject']] = val,
        null,
        () => console.log(permissionMap));
  }

  goBack() {
    this.location.back();
  }

}
