import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';

import { saveAs } from 'file-saver';
import { ReportBuilderService } from '../services/report-builder.service';
import { JsonToTablesUtil } from './json-to-tables.util';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { delay } from 'rxjs/operators';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'mds-report-tables',
  templateUrl: './report-tables.component.html',
  styleUrls: ['./report-tables.component.css']
})
export class ReportTablesComponent implements OnInit {

  util;
  data;

  googleMapsBasemap = 'hybrid';
  zoom = 15;

  constructor(public snackBar: MatSnackBar,
              public rbs: ReportBuilderService,
              public _location: Location,
              private router: Router,
              private errorService: ErrorService,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    if (!this.rbs.reportTableData) {
      setTimeout(() => {
        this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 5000});
        this.router.navigate(['reports']);
      }, 10)
    } else {
      this.util = new JsonToTablesUtil(this.rbs);
      this.data = this.util.getReportData();
      this.util.getMapUrl();
      document.getElementById('reports-content-wrapper').scrollTop = 0;
    }
  }

  startBuildingReport() {
    const REPORT_NAME = this.rbs.reportMetaData.modelName;
    this.rbs.complingReport = true;
    this.data.mapUrl = this.util.getMapUrl(this.googleMapsBasemap, this.zoom);
    this.rbs.startReportBuilding(this.data, REPORT_NAME)
      .subscribe(() => this.pollForZip(REPORT_NAME),
      err => {
        this.rbs.complingReport = false;
        this.errorService.handleServerError('Failed to create zip file', err, () => console.log(err));
      });
  }

  pollForZip(REPORT_NAME: string) {
    this.rbs.getReportZip(REPORT_NAME)
      .pipe(delay(5000))
      .subscribe(res => {
          if (res.status === 202) {
            console.log('Keep polling');
            this.pollForZip(REPORT_NAME);
          } else {
            this.rbs.complingReport = false;
            saveAs(res.body, `${REPORT_NAME}.zip`);
            this.router.navigate(['reports/download']);
          }
        },
        err => {
          this.rbs.complingReport = false;
          this.errorService.handleServerError('Failed to retrieve zip file', err, () => console.log(err))
        });
  }

  getOverflowMessage() {
    return '(Showing ' + this.data.sovData.showingCount + '/' + this.data.sovData.totalCount +
      ' stores. A total contribution to site of $' +
      Math.round(this.data.sovData.totalContributionExcluded).toLocaleString() +
      ' was excluded from the report.)'
  }

  adjustZoom(amount) {
    this.zoom += amount;
  }

}
