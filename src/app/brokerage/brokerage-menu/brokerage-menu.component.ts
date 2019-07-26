import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mds-brokerage-menu',
  templateUrl: './brokerage-menu.component.html',
  styleUrls: ['./brokerage-menu.component.css']
})
export class BrokerageMenuComponent implements OnInit {

  readonly menuOptions = [
    {
      routerLink: '/brokerage/images',
      iconClasses: 'fas fa-images',
      displayName: 'Append Logos'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
