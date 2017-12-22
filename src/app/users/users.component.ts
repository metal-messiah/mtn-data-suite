import {Component, OnInit} from '@angular/core';
import {UserProfile} from '../models/user-profile';
import {UserService} from '../services/user.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';
import {MatTableDataSource} from '@angular/material';
import {ErrorService} from '../services/error.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  isLoading = false;
  dataSource: MatTableDataSource<UserProfile>;
  displayedColumns = ['name', 'email', 'role', 'group', 'actions'];

  constructor(private userService: UserService,
              private router: Router,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.getUserProfiles();
  }

  private getUserProfiles(): void {
    this.isLoading = true;
    this.userService.getUserProfiles()
      .subscribe(
        pageable => this.dataSource = new MatTableDataSource(pageable.content),
        err => this.errorService.handleServerError('Failed to retrieve users', err,
          () => this.router.navigate(['/home']),
          () => this.getUserProfiles()),
        () => this.isLoading = false
      );
  }
}
