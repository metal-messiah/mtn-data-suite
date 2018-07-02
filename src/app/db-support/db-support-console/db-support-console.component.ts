import { Component, OnInit } from '@angular/core';
import { Site } from '../../models/full/site';
import { Duplicate } from '../../models/duplicate';

@Component({
  selector: 'mds-db-support-console',
  templateUrl: './db-support-console.component.html',
  styleUrls: ['./db-support-console.component.css']
})
export class DbSupportConsoleComponent implements OnInit {

  duplicates: Duplicate<Site>[];

  isLoading = false;

  constructor() {
  }

  ngOnInit() {

  }
}
