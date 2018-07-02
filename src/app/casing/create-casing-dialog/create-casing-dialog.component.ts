import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mds-create-casing-dialog',
  templateUrl: './create-casing-dialog.component.html',
  styleUrls: ['./create-casing-dialog.component.css']
})
export class CreateCasingDialogComponent implements OnInit {

  storeRemodeled = false;
  shoppingCenterRedeveloped = false;

  constructor() { }

  ngOnInit() {
  }
}
