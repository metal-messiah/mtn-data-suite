import { Component, OnInit } from '@angular/core';
import {Role} from '../models/role';
import {RoleService} from '../services/role.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  roles: Role[];

  constructor(
    private roleService: RoleService
  ) {}

  ngOnInit() {
    this.roleService.getRoles().subscribe(
      pageable => this.roles = pageable.content
    );
  }

}
