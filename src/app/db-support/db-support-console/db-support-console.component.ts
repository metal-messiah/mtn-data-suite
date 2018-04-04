import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DuplicateService } from '../../core/services/duplicate.service';
import { Site } from '../../models/site';
import { Duplicate } from '../../models/duplicate';

@Component({
  selector: 'app-db-support-console',
  templateUrl: './db-support-console.component.html',
  styleUrls: ['./db-support-console.component.css']
})
export class DbSupportConsoleComponent implements OnInit {

  duplicates: Duplicate<Site>[];

  isLoading = false;

  constructor(private duplicateService: DuplicateService,
              private router: Router) {
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

  goBack() {
    this.router.navigate(['/']);
  }

}
