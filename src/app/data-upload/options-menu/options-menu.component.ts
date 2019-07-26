import { Component } from '@angular/core';

@Component({
  selector: 'mds-options-menu',
  templateUrl: './options-menu.component.html',
  styleUrls: ['./options-menu.component.css']
})
export class OptionsMenuComponent {

  constructor() {
  }

  getMenuItems() {
    return [
      {
        routerLink: '/data-upload/matching',
        iconClasses: 'fas fa-file-excel',
        displayName: 'Match a spreadsheet'
      },
      {
        routerLink: '/data-upload/update',
        queryParams: {'source-name': 'Planned Grocery'},
        iconClasses: 'fas fa-shopping-basket',
        displayName: 'Planned Grocery'
      },
      {
        routerLink: '/data-upload/chain-xy',
        iconClasses: 'fas fa-link',
        displayName: 'ChainXy'
      },
      {
        routerLink: '/data-upload/cloudinary',
        iconClasses: 'fas fa-cloud',
        displayName: 'Cloudinary Logos'
      }
    ];
  }

}
