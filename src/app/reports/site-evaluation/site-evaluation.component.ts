import { Component, OnInit } from '@angular/core';
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

  readonly ratingOptions = ['Excellent', 'Good', 'Average', 'Fair', 'Poor', 'TBD'];

  constructor(public _location: Location,
              private router: Router,
              private snackBar: MatSnackBar,
              public rbs: ReportBuilderService) {
  }

  ngOnInit() {
    if (!this.rbs.getReportTableData()) {
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
    let cvRecord;
    if (this.rbs.getReportTableData().currentVolumes) {
      cvRecord = this.rbs.getReportTableData().currentVolumes.find(record => {
        return record.mapKey === this.rbs.getReportTableData().selectedMapKey;
      });
    }
    const sisterStoresAffected = this.rbs.getReportTableData().storeList
      .filter(store => {
        return store.category === 'Company Store' && store.mapKey !== this.rbs.getReportTableData().selectedMapKey
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

    if (cvRecord) {
      this.rbs.siteEvaluationNarrativeForm.get('assumedPower').setValue(cvRecord.assumedPower);
    }
    if (sisterStoresAffected) {
      this.rbs.siteEvaluationNarrativeForm.get('affectedSisterStores').setValue(sisterStoresAffected);
    }
  }

  next() {
    this.router.navigate(['reports/table-preview']);
  }

}
