import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReportBuilderService } from '../services/report-builder.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'mds-site-evaluation',
  templateUrl: './site-evaluation.component.html',
  styleUrls: ['./site-evaluation.component.css']
})
export class SiteEvaluationComponent implements OnInit {

  form: FormGroup;

  readonly ratingOptions = ['Excellent', 'Good', 'Average', 'Fair', 'Poor'];

  constructor(private fb: FormBuilder,
              public _location: Location,
              private router: Router,
              private snackBar: MatSnackBar,
              private rbs: ReportBuilderService) {
  }

  ngOnInit() {
    if (!this.rbs.reportTableData) {
      setTimeout(() => {
        this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 5000});
        this.router.navigate(['reports']);
      }, 10)
    } else {
      this.createForm();
      document.getElementById('reports-content-wrapper').scrollTop = 0;
    }
  }

  private createForm() {
    this.form = this.fb.group({
      streetConditions: '',
      comments: '',
      trafficControls: '',
      cotenants: '',
      accessNorth: 'Average',
      accessSouth: 'Average',
      accessEast: 'Average',
      accessWest: 'Average',
      ingressEgress: 'Average',
      visibilityNorth: 'Average',
      visibilitySouth: 'Average',
      visibilityEast: 'Average',
      visibilityWest: 'Average',
      populationDensityNorth: 'Average',
      populationDensitySouth: 'Average',
      populationDensityEast: 'Average',
      populationDensityWest: 'Average',
    });
  }

  next() {
    this.rbs.setSiteEvaluationData(this.form.value);
    this.router.navigate(['reports/table-preview']);
  }

}
