import {Component, OnInit} from '@angular/core';
import {Role} from '../models/role';
import {RoleService} from '../services/role.service';
import {MatTableDataSource} from '@angular/material';
import {ErrorModalComponent} from '../error-modal/error-modal.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  isLoading = false;
  dataSource: MatTableDataSource<Role>;
  displayedColumns = ['displayName', 'description', 'actions'];

  constructor(
    private roleService: RoleService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit() {
    this.getRoles();
  }

  private getRoles(): void {
    this.isLoading = true;
    this.roleService.getRoles()
      .subscribe(
        pageable => this.dataSource = new MatTableDataSource(pageable.content),
        err => this.handleServerError('Failed to retrieve roles', err),
        () => this.isLoading = false
      );
  }

  private handleErrorDialogResult(result): void {
    this.getRoles();
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
