import { Component, OnInit } from '@angular/core';
import { DuplicateService } from '../../core/services/duplicate.service';
import { Duplicate } from '../../models/duplicate';
import { Site } from '../../models/site';
import { Router } from '@angular/router';

@Component({
  selector: 'app-database-support',
  templateUrl: './database-support.component.html',
  styleUrls: ['./database-support.component.css']
})
export class DatabaseSupportComponent implements OnInit {

  duplicates: Duplicate<Site>[];

  isLoading = false;

  constructor(
    private duplicateService: DuplicateService,
    private router: Router
  ) {}

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
