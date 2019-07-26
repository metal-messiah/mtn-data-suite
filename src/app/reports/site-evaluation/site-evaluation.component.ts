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

  constructor(private router: Router,
              private snackBar: MatSnackBar,
              private _rbs: ReportBuilderService,
              private host: ElementRef) {
  }

  ngOnInit() {
    if (!this._rbs.getReportTableData()) {
      setTimeout(() => {
        this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 2000});
        this.router.navigate(['reports']);
      }, 10)
    } else {
      this.createForm();
      this.host.nativeElement.scrollTop = 0;
    }
  }

  get rbs() {
    return this._rbs;
  }

  private createForm() {
    let cvRecord;
    if (this._rbs.getReportTableData().currentVolumes) {
      cvRecord = this._rbs.getReportTableData().currentVolumes.find(record => {
        return record.mapKey === this._rbs.getReportTableData().selectedMapKey;
      });
    }
    const sisterStoresAffected = this._rbs.getReportTableData().storeList
      .filter(store => {
        return store.category === 'Company Store' && store.mapKey !== this._rbs.getReportTableData().selectedMapKey
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
      this._rbs.siteEvaluationNarrativeForm.get('assumedPower').setValue(cvRecord.assumedPower);
    }
    if (sisterStoresAffected) {
      this._rbs.siteEvaluationNarrativeForm.get('affectedSisterStores').setValue(sisterStoresAffected);
    }
  }

  next() {
    this.router.navigate(['reports/table-preview']);
  }

}
