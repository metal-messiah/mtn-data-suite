import {Component, OnInit} from '@angular/core';
import {User} from '../models/user';
import {UserService} from '../services/user.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ErrorModalComponent} from '../error-modal/error-modal.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: User[];

  constructor(
    private userService: UserService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.getUserProfiles();
  }

  private getUserProfiles(): void {
    this.userService.getUserProfiles()
      .subscribe(
        pageable => this.users = pageable.content,
        err => this.handleServerError('Failed to retrieve users', err)
      );
  }

  private handleServerError(message: string, err: object): void {
    const modalRef = this.modalService.open(ErrorModalComponent);
    modalRef.componentInstance.name = 'World';
  }
}
