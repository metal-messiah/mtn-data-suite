import { Component, OnInit } from '@angular/core';
import { DuplicateService } from '../../core/services/duplicate.service';
import { Duplicate } from '../../models/duplicate';
import { Site } from '../../models/site';
import { Router } from '@angular/router';
import { MapService } from '../../core/services/map.service';

@Component({
  selector: 'app-database-dashboard',
  templateUrl: './database-dashboard.component.html',
  styleUrls: ['./database-dashboard.component.css'],
  providers: [MapService]
})
export class DatabaseDashboardComponent implements OnInit {

  duplicates: Duplicate<Site>[];

  isLoading = false;

  constructor(
    private duplicateService: DuplicateService,
    private mapService: MapService,

    // TODO Do I need Router anymore? You don't have it in casing-dashboard.component.ts
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
