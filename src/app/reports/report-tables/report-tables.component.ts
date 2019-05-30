import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';

import { saveAs } from 'file-saver';
import { ReportBuilderService } from '../services/report-builder.service';
import { JsonToTablesUtil } from './json-to-tables.util';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { delay, map, tap } from 'rxjs/operators';
import { ErrorService } from '../../core/services/error.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'mds-report-tables',
  templateUrl: './report-tables.component.html',
  styleUrls: ['./report-tables.component.css']
})
export class ReportTablesComponent implements OnInit {

  util: JsonToTablesUtil;
  reportData;

  googleMapsBasemap = 'hybrid';
  zoom = 15;

  pdfs = {};

  constructor(public snackBar: MatSnackBar,
              public rbs: ReportBuilderService,
              public _location: Location,
              private router: Router,
              private errorService: ErrorService,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    if (!this.rbs.getReportTableData()) {
      setTimeout(() => {
        this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 5000});
        this.router.navigate(['reports']);
      }, 10)
    } else {
      document.getElementById('reports-content-wrapper').scrollTop = 0;

      this.util = new JsonToTablesUtil(this.rbs);
      this.reportData = this.util.getReportData();
      this.getPdfData()
    }
  }

  getPdfData() {
    const requests = [];
    this.tableNames.forEach(tableName => {
      requests.push(this.rbs.getPdf(tableName, this.reportData[tableName]).pipe(tap(response => {
        this.pdfs[tableName] = {
          data: response,
          zoom: tableName === 'ratings' ? 0.2 : 0.7,
          originalSize: false,
          autoResize: true,
          fitToPage: false
        }
      })))
    });

    forkJoin(requests).subscribe(() => {},
      err => this.errorService.handleServerError('Failed to get table preview!', err,
        () => console.log(err)));
  }

  get tableNames() {
    return this.util.tableNames;
  }

  zoomIn(tableName: string) {
    this.reportData.pdfs[tableName].zoom += 0.1;
  }

  zoomOut(tableName: string) {
    this.reportData.pdfs[tableName].zoom -= 0.1;
  }

  startBuildingReport() {
    const REPORT_NAME = this.rbs.getReportMetaData().modelName;
    this.rbs.compilingReport = true;
    this.reportData.mapUrl = this.util.getMapUrl(this.googleMapsBasemap, this.zoom);
    this.rbs.startReportBuilding(this.reportData, REPORT_NAME)
      .subscribe(() => this.pollForZip(REPORT_NAME),
      err => {
        this.rbs.compilingReport = false;
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
            this.rbs.compilingReport = false;
            saveAs(res.body, `${REPORT_NAME}.zip`);
            this.router.navigate(['reports/download']);
          }
        },
        err => {
          this.rbs.compilingReport = false;
          this.errorService.handleServerError('Failed to retrieve zip file', err, () => console.log(err))
        });
  }

  getOverflowMessage() {
    return '(Showing ' + this.reportData.sovData.showingCount + '/' + this.reportData.sovData.totalCount +
      ' stores. A total contribution to site of $' +
      Math.round(this.reportData.sovData.totalContributionExcluded).toLocaleString() +
      ' was excluded from the report.)'
  }

  adjustZoom(amount) {
    this.zoom += amount;
  }

}
