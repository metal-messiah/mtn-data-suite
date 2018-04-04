import {Component, OnInit} from '@angular/core';

import {Role} from '../../models/role';
import {RoleService} from '../../core/services/role.service';
import {Router} from '@angular/router';
import {BasicEntityListComponent} from '../../interfaces/basic-entity-list-component';
import {EntityListService} from '../../core/services/entity-list.service';

@Component({
  selector: 'mds-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit, BasicEntityListComponent<Role> {

  roles: Role[];

  isLoading = false;
  isDeleting = false;

  constructor(private roleService: RoleService,
              private router: Router,
              private els: EntityListService<Role>) {
  }

  ngOnInit() {
    this.els.initialize(this);
  }

  confirmDelete(role: Role) {
    this.els.confirmDelete(this, role);
  }

  goBack() {
    this.router.navigate(['admin']);
  }

  getPluralTypeName(): string {
    return 'roles';
  }

  getEntityService(): RoleService {
    return this.roleService;
  }

  getTypeName(): string {
    return 'role';
  }

  setEntities(roles: Role[]): void {
    this.roles = roles;
  }

  sortCompare(a: Role, b: Role): number {
    return a.displayName.localeCompare(b.displayName);
  }
}
