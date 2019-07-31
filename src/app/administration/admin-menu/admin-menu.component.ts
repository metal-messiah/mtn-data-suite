import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mds-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  getMenuItems() {
    return [
      {
        routerLink: '/admin/users',
        iconClasses: 'fas fa-address-book',
        displayName: 'Users'
      },
      {
        routerLink: '/admin/groups',
        iconClasses: 'fas fa-users',
        displayName: 'Groups'
      },
      {
        routerLink: '/admin/roles',
        iconClasses: 'fas fa-id-badge',
        displayName: 'Roles'
      },
    ];
  }

}
