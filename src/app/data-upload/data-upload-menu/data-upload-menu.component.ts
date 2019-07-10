import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'mds-data-upload-menu',
    templateUrl: './data-upload-menu.component.html',
    styleUrls: [ './data-upload-menu.component.css' ]
})
export class DataUploadMenuComponent implements OnInit {

    options = [
      {
        displayName: 'Match a Spreadsheet',
        iconClasses: 'fas fa-file-alt',
        routerLink: '/data-upload/matching',
      },
      {
        displayName: 'Upload from Planned Grocery',
        iconClasses: 'fas fa-shopping-basket',
        routerLink: '/data-upload/planned-grocery',
        disabled: false
      },
      {
        displayName: 'Upload from ChainXY',
        iconClasses: 'fas fa-link',
        routerLink: '/data-upload/chain-xy',
        disabled: false
      },
      {
        displayName: 'Cloudinary',
        iconClasses: 'fas fa-cloud',
        routerLink: '/data-upload/cloudinary',
        disabled: false
      }
      // {
      //   displayName: 'Upload a Spreadsheet',
      //   iconClasses: 'fas fa-file-alt',
      //   routerLink: '/data-upload/spreadsheet',
      //   disabled: true
      // },
      // {
      //   displayName: 'Upload Commissary Data',
      //   iconClasses: 'fas fa-parachute-box',
      //   routerLink: '/data-upload/commissary',
      //   disabled: true
      // },
    ];

    ngOnInit() {}
}
