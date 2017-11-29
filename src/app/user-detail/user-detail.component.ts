import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';

import {User} from '../models/user';
import {Role} from '../models/role';
import {Group} from '../models/group';

import {UserService} from '../services/user.service';
import {RoleService} from '../services/role.service';
import {GroupService} from '../services/group.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {

  user: User;
  roles: Role[];
  groups: Group[];

  constructor(private route: ActivatedRoute,
              private userService: UserService,
              private roleService: RoleService,
              private groupService: GroupService,
              private location: Location) {
  }

  ngOnInit() {
    this.getUser();
    this.getRoles();
    this.getGroups();
  }

  getUser(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    if (id === null) {
      this.user = new User();
    } else {
      this.userService.getUserProfile(id).subscribe(
        user => this.user = user
      );
    }
  }

  getRoles(): void {
    this.roleService.getRoles()
      .subscribe(
        pageable => this.roles = pageable.content
      );
  }

  getGroups(): void {
    this.groupService.getGroups()
      .subscribe(
        pageable => this.groups = pageable.content
      );
  }

  goBack() {
    this.location.back();
  }

  submit() {
    this.userService.saveUser(this.user).subscribe(
      user => console.log('Saved User: ' + user['id'])
    );
  }

}
