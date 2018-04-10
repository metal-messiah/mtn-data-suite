import { Component, OnInit } from '@angular/core';
import { DuplicateService } from '../../core/services/duplicate.service';
import { Duplicate } from '../../models/duplicate';
import { Site } from '../../models/site';
import { Router } from '@angular/router';
import { MapService } from '../../core/services/map.service';

@Component({
  selector: 'mds-database-dashboard',
  templateUrl: './db-support-dashboard.component.html',
  styleUrls: ['./db-support-dashboard.component.css']
})
export class DbSupportDashboardComponent implements OnInit {

  duplicates: Duplicate<Site>[];

  isLoading = false;

  constructor(
    private duplicateService: DuplicateService,
    private mapService: MapService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.duplicateService.getAll()
      .subscribe(
        duplicateSites => {
          this.duplicates = duplicateSites;
        },
        err => console.log(`Hit error, ${err}`)
      );
  }

  // TODO admin doesn't have this but your back button works somehow. What am I missing?
  goBack() {
    this.router.navigate(['/']);
  }

}
