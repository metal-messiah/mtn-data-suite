import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'mds-app-info-dialog',
  templateUrl: './app-info-dialog.component.html',
  styleUrls: ['./app-info-dialog.component.css']
})
export class AppInfoDialogComponent implements OnInit {

  version: string;

  constructor() { }

  ngOnInit() {
    this.version = environment.VERSION;
  }

}
