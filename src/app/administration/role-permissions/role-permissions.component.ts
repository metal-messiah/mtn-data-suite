import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { Role } from '../../models/full/role';
import { RoleService } from '../../core/services/role.service';
import { finalize, tap } from 'rxjs/operators';
import { PermissionService } from '../../core/services/permission.service';
import { forkJoin } from 'rxjs';
import { ErrorService } from '../../core/services/error.service';
import * as _ from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SimplifiedPermission } from '../../models/simplified/simplified-permission';

@Component({
  selector: 'mds-role-permissions',
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.css']
})
export class RolePermissionsComponent implements OnInit {

  form: FormGroup;

  permissions: SimplifiedPermission[];
  subjects: string[];
  actions = ['CREATE', 'READ', 'UPDATE', 'DELETE'];

  role: Role;

  isLoading = false;
  saving = false;

  constructor(private roleService: RoleService,
              private permissionService: PermissionService,
              private snackBar: MatSnackBar,
              private errorService: ErrorService,
              private fb: FormBuilder,
              private dialoRef: MatDialogRef<RolePermissionsComponent>,
              @Inject(MAT_DIALOG_DATA) private data: { roleId: number }) {
  }

  ngOnInit() {
    this.getData();
  }

  titleCase(str) {
    return str.toLowerCase().split('_').map(function (word) {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }

  save() {
    const permissionIds = this.getSelectedPermissionIds();

    this.saving = true;
    this.roleService.updateRolePermissions(this.role.id, permissionIds)
      .pipe(finalize(() => this.saving = false))
      .subscribe(() => {
        this.snackBar.open('Successfully updated role permissions', null, {duration: 2000});
        this.dialoRef.close();
      }, err => this.errorService.handleServerError('Failed to save permissions!', err,
        () => console.log(err), () => this.save()));
  }

  private getSelectedPermissionIds() {
    const selectedPermissions = this.permissions.filter(p => this.form.get([p.subject, p.action]).value);
    return selectedPermissions.map(p => p.id);
  }

  private getData() {
    const getRole = this.roleService.getOneById(this.data.roleId)
      .pipe(tap(role => this.role = role));
    const getPermissions = this.permissionService.getPermissions()
      .pipe(tap(page => {
        this.permissions = page.content;
        this.createForm();
      }));

    this.isLoading = true;
    forkJoin(getRole, getPermissions)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(() => this.role.permissions.forEach(permission => {
          this.form.get(permission.subject).get(permission.action).setValue(true);
        }),
        err => this.errorService.handleServerError('Failed to get data!', err,
          () => this.dialoRef.close(), () => this.getData())
      );
  }

  private createForm() {
    this.form = this.fb.group({});

    this.subjects = _.uniq(this.permissions.map(p => p.subject)).sort();
    this.subjects.forEach(subject => {
      const subjectGroup = this.fb.group({});

      this.actions.forEach(action => {
        const permission = this.permissions.find(p => p.subject === subject && p.action === action);
        if (permission) {
          subjectGroup.addControl(action, this.fb.control(false));
        }
      });

      this.form.addControl(subject, subjectGroup);
    });
  }

}
