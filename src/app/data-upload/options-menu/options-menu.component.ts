import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mds-options-menu',
  templateUrl: './options-menu.component.html',
  styleUrls: ['./options-menu.component.css']
})
export class OptionsMenuComponent implements OnInit {
  options: object[];

  constructor() {
    // disabled hides list-item if true
    this.options = [
      {
        label: 'Upload a Spreadsheet',
        icon: 'fas fa-file-alt',
        link: 'spreadsheet',
        disabled: false
      },
      {
        label: 'Upload from Planned Grocery',
        icon: 'fas fa-shopping-basket',
        link: 'planned-grocery',
        disabled: false
      },
      {
        label: 'Upload from ChainXY',
        icon: 'fas fa-link',
        link: 'chain-xy',
        disabled: true
      },
      {
        label: 'Upload Commissary Data',
        icon: 'fas fa-parachute-box',
        link: 'commissary',
        disabled: true
      }
    ];
  }

  ngOnInit() {}
}
