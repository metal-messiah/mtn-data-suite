import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mds-options-menu',
  templateUrl: './options-menu.component.html',
  styleUrls: ['./options-menu.component.css']
})
export class OptionsMenuComponent implements OnInit {

  constructor() {
    console.log("options menu component")
   }

  ngOnInit() {
  }

}
