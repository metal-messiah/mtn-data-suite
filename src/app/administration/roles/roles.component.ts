import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../core/services/role.service';
import { Router } from '@angular/router';
import { ErrorService } from '../../core/services/error.service';
import { SimplifiedRole } from '../../models/simplified/simplified-role';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/internal/operators';
import { MatDialog, Sort } from '@angular/material';
import { CompareUtil } from '../../utils/compare-util';
import { RolePermissionsComponent } from '../role-permissions/role-permissions.component';

@Component({
  selector: 'mds-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css', '../list-view.css']
})
export class RolesComponent implements OnInit {

  roles: SimplifiedRole[];

  isLoading = false;

  constructor(private roleService: RoleService,
              private router: Router,
              private _location: Location,
              private dialog: MatDialog,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.getRoles();
  }

  sortData(sort: Sort) {
    if (sort.active === 'displayName') {
      this.roles.sort((a, b) => {
        return CompareUtil.compareStrings(a.displayName, b.displayName, sort.direction === 'desc');
      });
    } else {
      this.roles.sort((a, b) => a.id - b.id);
    }
  }

  editPermissions($event, role) {
    $event.stopPropagation();
    this.dialog.open(RolePermissionsComponent, {data: {roleId: role.id}, disableClose: true});
  }

  private getRoles(): void {
    this.isLoading = true;
    this.roleService.getAllRoles()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(page => this.roles = page.content,
        err => this.errorService.handleServerError(`Failed to retrieve Roles`, err,
          () => this._location.back(), () => this.getRoles())
      );
  }

}
