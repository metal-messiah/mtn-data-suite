import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DuplicateService } from '../../core/services/duplicate.service';
import { Duplicate } from '../../models/duplicate';
import { Site } from '../../models/site';

@Component({
  selector: 'app-duplicate-merging',
  templateUrl: './duplicate-merging.component.html',
  styleUrls: ['./duplicate-merging.component.css']
})

export class DuplicateMergingComponent implements OnInit {

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
