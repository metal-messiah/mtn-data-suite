import { Component, OnInit } from '@angular/core';

import { Role } from '../../models/role';
import { RoleService } from '../../core/services/role.service';
import { Router } from '@angular/router';
import { BasicEntityListComponent } from '../../interfaces/basic-entity-list-component';
import { EntityListService } from '../../core/services/entity-list.service';
import { ErrorService } from '../../core/services/error.service';
import { SimplifiedRole } from '../../models/simplified-role';

@Component({
  selector: 'mds-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit, BasicEntityListComponent<Role> {

  roles: SimplifiedRole[];

  isLoading = false;
  isDeleting = false;

  constructor(private roleService: RoleService,
              private router: Router,
              private els: EntityListService<Role>,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.els.initialize(this);
  }

  loadEntities(): void {
    this.roleService.getAllRoles()
      .finally(() => this.isLoading = false)
      .subscribe(
        pageable => this.roles = pageable.content.sort(this.sortCompare),
        err => this.errorService.handleServerError(`Failed to retrieve Roles`, err,
          () => this.goBack(),
          () => this.els.initialize(this))
      );
  };

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

  sortCompare(a: Role, b: Role): number {
    return a.displayName.localeCompare(b.displayName);
  }
}
