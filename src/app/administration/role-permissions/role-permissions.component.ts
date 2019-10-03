import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { Role } from '../../models/full/role';
import { RoleService } from '../../core/services/role.service';
import { finalize } from 'rxjs/operators';
import { ErrorService } from '../../core/services/error.service';
import { PermissionTableComponent } from '../permission-table/permission-table.component';

@Component({
  selector: 'mds-role-permissions',
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.css']
})
export class RolePermissionsComponent implements OnInit {

  role: Role;

  saving = false;

  @ViewChild('permissionsTable', {static: false}) permissionTable: PermissionTableComponent;

  constructor(private roleService: RoleService,
              private snackBar: MatSnackBar,
              private errorService: ErrorService,
              private dialoRef: MatDialogRef<RolePermissionsComponent>,
              @Inject(MAT_DIALOG_DATA) private data: { roleId: number }) {
  }

  ngOnInit() {
    this.getRole();
  }

  save() {
    const permissionIds = this.permissionTable.getSelectedPermissionIds();

    this.saving = true;
    this.roleService.updateRolePermissions(this.role.id, permissionIds)
      .pipe(finalize(() => this.saving = false))
      .subscribe(() => {
        this.snackBar.open('Successfully updated role permissions', null, {duration: 2000});
        this.dialoRef.close();
      }, err => this.errorService.handleServerError('Failed to save permissions!', err,
        () => console.log(err), () => this.save()));
  }

  private getRole() {
    this.roleService.getOneById(this.data.roleId)
      .subscribe(role => this.role = role,
        err => this.errorService.handleServerError('Failed to get Role!', err,
          () => this.dialoRef.close(), () => this.getRole())
      );
  }

}
