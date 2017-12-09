import {Component, OnInit} from '@angular/core';
import {User} from '../models/user';
import {UserService} from '../services/user.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ErrorModalComponent} from '../error-modal/error-modal.component';
import {Router} from '@angular/router';
import {MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  isLoading = false;
  dataSource: MatTableDataSource<User>;
  displayedColumns = ['name', 'email', 'role', 'group', 'actions'];

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit() {
    this.getUserProfiles();
  }

  private getUserProfiles(): void {
    this.isLoading = true;
    this.userService.getUserProfiles()
      .subscribe(
        pageable => this.dataSource = new MatTableDataSource(pageable.content),
        err => this.handleServerError('Failed to retrieve users', err),
        () => this.isLoading = false
      );
  }

  private handleErrorDialogResult(result): void {
    this.getUserProfiles();
  }

  private handleServerError(message: string, err: object): void {
    const modalRef = this.modalService.open(ErrorModalComponent);
    modalRef.result.then(
      (result) => this.handleErrorDialogResult(result),
      (reason) => this.router.navigate(['/home']));
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.reason = err['message'];
    modalRef.componentInstance.status = err['status'];
  }
}
