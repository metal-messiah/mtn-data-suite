import {Component, OnInit} from '@angular/core';
import {UserProfileService} from '../../core/services/user.service';
import {Router} from '@angular/router';
import {ErrorService} from '../../core/services/error.service';
import {UserProfile} from '../../models/user-profile';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ConfirmDialogComponent} from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: UserProfile[];
  isLoading = false;
  isDeleting = false;

  constructor(private userService: UserProfileService,
              private errorService: ErrorService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private router: Router) {
  }

  ngOnInit() {
    this.getUserProfiles();
  }

  delete(user: UserProfile) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {title: 'Delete User!', question: `Are you sure you wish to delete ${user.firstName} ${user.lastName}?`}
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.deleteUser(user);
      }
    });
  }

  goBack() {
    this.router.navigate(['admin']);
  }

  private deleteUser(user: UserProfile) {
    this.isDeleting = true;
    this.userService.del(user).subscribe(
      () => {
        this.snackBar.open('Successfully deleted user!', null, {duration: 2000});
        this.getUserProfiles();
      },
      err => this.errorService.handleServerError('Failed to delete user!', err,
        () => this.isDeleting = false,
        () => this.deleteUser(user)),
      () => this.isDeleting = false
    );
  }

  private getUserProfiles(): void {
    this.isLoading = true;
    this.userService.getAll()
      .subscribe(
        pageable => this.users = pageable.content.sort(function(a, b) {
          const getVal = (obj) => obj.firstName ? obj.firstName : obj.lastName ? obj.lastName : obj.email;
          return getVal(a).localeCompare(getVal(b));
        }),
        err => this.errorService.handleServerError('Failed to retrieve users', err,
          () => this.goBack(),
          () => this.getUserProfiles()),
        () => this.isLoading = false
      );
  }
}
