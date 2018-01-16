import {Component, OnInit} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';

import {Role} from '../../models/role';
import {RoleService} from '../../core/services/role.service';
import {ErrorService} from '../../core/services/error.service';
import {ConfirmDialogComponent} from '../../shared/confirm-dialog/confirm-dialog.component';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  roles: Role[];
  isLoading = false;
  isDeleting = false;

  constructor(private roleService: RoleService,
              private errorService: ErrorService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private router: Router) {
  }

  ngOnInit() {
    this.getRoles();
  }

  delete(role: Role) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {title: 'Delete Role!', question: `Are you sure you wish to delete the ${role.displayName} role?`}
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.deleteRole(role);
      }
    });
  }

  goBack() {
    this.router.navigate(['admin']);
  }

  private deleteRole(role: Role) {
    this.isDeleting = true;
    this.roleService.deleteRole(role).subscribe(
      () => {
        this.snackBar.open('Successfully deleted role!', null, {duration: 2000});
        this.getRoles();
      },
      err => this.errorService.handleServerError('Failed to delete role!', err,
        () => this.isDeleting = false,
        () => this.deleteRole(role)),
      () => this.isDeleting = false
    );
  }

  private getRoles(): void {
    this.isLoading = true;
    this.roleService.getRoles()
      .subscribe(
        pageable => this.roles = pageable.content.sort(function (a, b) {
          return a.displayName.localeCompare(b.displayName);
        }),
        err => this.errorService.handleServerError('Failed to retrieve roles', err,
          () => this.goBack(),
          () => this.getRoles()),
        () => this.isLoading = false
      );
  }
}
