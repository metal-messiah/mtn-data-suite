import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'mds-db-support-console',
  templateUrl: './db-support-console.component.html',
  styleUrls: ['./db-support-console.component.css']
})
export class DbSupportConsoleComponent implements OnInit {

  constructor(
    private _location: Location,
  ) {
  }

  ngOnInit() {

  }

  goBack() {
    this._location.back();
  };
}
