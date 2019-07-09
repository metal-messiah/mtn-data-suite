import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'mds-menu-list',
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.css']
})
export class MenuListComponent implements OnInit {

  @Input() menuItems: {
    routerLink: string,
    queryParams?: object,
    displayName: string,
    iconClasses: string
  }[];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  navigateTo(menuItem) {
    this.router.navigate([menuItem.routerLink], {queryParams: menuItem.queryParams});
  }

}
