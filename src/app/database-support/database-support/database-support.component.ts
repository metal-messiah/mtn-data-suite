import { Component, OnInit } from '@angular/core';
import { Duplicate } from '../../models/duplicate';
import { Site } from '../../models/site';
import { Router } from '@angular/router';

@Component({
  selector: 'mds-database-support',
  templateUrl: './database-support.component.html',
  styleUrls: ['./database-support.component.css']
})
export class DatabaseSupportComponent implements OnInit {

  duplicates: Duplicate<Site>[];

  isLoading = false;

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/']);
  }

}
