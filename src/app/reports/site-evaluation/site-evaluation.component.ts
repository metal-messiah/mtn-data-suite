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
  ratingsForm: FormGroup;

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
      executiveSummary: '',
      scenario: '',
      assumedPower: '',
      competitiveChanges: '',
      streetConditions: '',
      comments: '',
      trafficControls: '',
      cotenants: '',
      affectedSisterStores: ''
    });
    this.ratingsForm = this.fb.group({
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
      populationDensityWest: 'Average'
    });

    const sisterStoresAffected = this.rbs.reportTableData.storeList
      .filter(store => {
        return store.category === 'Company Store' && store.mapKey !== this.rbs.reportTableData.selectedMapKey
      })
      .sort((a, b) => {
        if (a.storeName === b.storeName) {
          return a.mapKey - b.mapKey;
        } else {
          return a.storeName.localeCompare(b.storeName);
        }
      })
      .map(store => `${store.storeName} ${store.mapKey}`)
      .join('\r\n');
    this.form.get('affectedSisterStores').setValue(sisterStoresAffected)
  }

  next() {
    this.rbs.setSiteEvaluationNarrative(this.form.value);
    this.rbs.setSiteEvaluationRatings(this.ratingsForm.value);
    this.router.navigate(['reports/table-preview']);
  }

}
