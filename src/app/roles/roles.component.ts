import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {MatTableDataSource} from '@angular/material';

import {Role} from '../models/role';
import {RoleService} from '../services/role.service';
import {ErrorService} from '../services/error.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  isLoading = false;
  dataSource: MatTableDataSource<Role>;
  displayedColumns = ['displayName', 'description', 'actions'];

  constructor(private roleService: RoleService,
              private location: Location,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.getRoles();
  }

  goBack() {
    this.location.back();
  }

  private getRoles(): void {
    this.isLoading = true;
    this.roleService.getRoles()
      .subscribe(
        pageable => this.dataSource = new MatTableDataSource(pageable.content),
        err => this.errorService.handleServerError('Failed to retrieve roles', err,
          () => this.location.back(),
          () => this.getRoles()),
        () => this.isLoading = false
      );
  }
}
