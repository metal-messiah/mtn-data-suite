import { Component, ElementRef, OnInit } from '@angular/core';
import { ReportBuilderService } from '../services/report-builder.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'mds-site-evaluation',
  templateUrl: './site-evaluation.component.html',
  styleUrls: ['./site-evaluation.component.css', '../shared-report-style.css']
})
export class SiteEvaluationComponent implements OnInit {

  readonly ratingOptions = ['Excellent', 'Good', 'Average', 'Fair', 'Poor', 'TBD'];
  readonly directions = ['North', 'South', 'East', 'West'];

  constructor(private router: Router,
              private snackBar: MatSnackBar,
              private _rbs: ReportBuilderService,
              private host: ElementRef) {
  }

  get saving() {
    return this._rbs.saving;
  }

  get siteEvaluationNarrativeForm() {
    return this._rbs.siteEvaluationNarrativeForm;
  }

  get siteEvaluationRatingsForm() {
    return this._rbs.siteEvaluationRatingsForm;
  }

  ngOnInit() {
    if (this._rbs.getReportTableData()) {
      this.initFormData();
    } else {
      this._rbs.loadLatest().subscribe(() => {
        this.initFormData();
        this.snackBar.open('Loaded latest model', null, {duration: 2000});
      }, err => {
        this.snackBar.open(err, null, {duration: 2000});
        this.router.navigate(['reports']);
      });
    }
  }

  private initFormData() {
    // If the affected sister stores hasn't already been set by a loaded model
    if (!this._rbs.siteEvaluationNarrativeForm.get('affectedSisterStores').value) {
      // If there are affected sister stores - add them to the form
      const sisterStoresAffected = this._rbs.getReportTableData().storeList
        .filter(store => store.category === 'Company Store' && store.mapKey !== this._rbs.getReportTableData().selectedMapKey)
        .sort((a, b) => {
          if (a.storeName === b.storeName) {
            return a.mapKey - b.mapKey;
          } else {
            return a.storeName.localeCompare(b.storeName);
          }
        })
        .map(store => `${store.storeName} ${store.mapKey}`)
        .join('\r\n');

      if (sisterStoresAffected) {
        this.siteEvaluationNarrativeForm.get('affectedSisterStores').setValue(sisterStoresAffected);
      }
    }

    this.host.nativeElement.scrollTop = 0;
  }

}
