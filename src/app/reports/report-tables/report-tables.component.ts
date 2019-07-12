import { Component, ElementRef, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { saveAs } from 'file-saver';
import { ReportBuilderService } from '../services/report-builder.service';
import { JsonToTablesUtil } from './json-to-tables.util';
import { Router } from '@angular/router';
import { delay, tap } from 'rxjs/operators';
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

  constructor(private snackBar: MatSnackBar,
              private _rbs: ReportBuilderService,
              private router: Router,
              private errorService: ErrorService,
              private host: ElementRef) {
  }

  ngOnInit() {
    if (!this._rbs.getReportTableData()) {
      setTimeout(() => {
        this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 2000});
        this.router.navigate(['reports']);
      }, 10)
    } else {
      this.host.nativeElement.scrollTop = 0;

      this.util = new JsonToTablesUtil(this._rbs);
      this.reportData = this.util.getReportData();
      this.getPdfData()
    }
  }

  get rbs() {
    return this._rbs;
  }

  getPdfData() {
    const requests = [];
    this.tableNames.forEach(tableName => {
      requests.push(this._rbs.getPdf(tableName, this.reportData[tableName]).pipe(tap(response => {
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
    this.pdfs[tableName].zoom += 0.1;
  }

  zoomOut(tableName: string) {
    this.pdfs[tableName].zoom -= 0.1;
  }

  startBuildingReport() {
    const REPORT_NAME = this._rbs.getReportMetaData().modelName;
    this._rbs.compilingReport = true;
    this.reportData.mapUrl = this.util.getMapUrl(this.googleMapsBasemap, this.zoom);
    this._rbs.startReportBuilding(this.reportData, REPORT_NAME)
      .subscribe(() => this.pollForZip(REPORT_NAME),
      err => {
        this._rbs.compilingReport = false;
        this.errorService.handleServerError('Failed to create zip file', err, () => console.log(err));
      });
  }

  pollForZip(REPORT_NAME: string) {
    this._rbs.getReportZip(REPORT_NAME)
      .pipe(delay(5000))
      .subscribe(res => {
          if (res.status === 202) {
            console.log('Keep polling');
            this.pollForZip(REPORT_NAME);
          } else {
            this._rbs.compilingReport = false;
            saveAs(res.body, `${REPORT_NAME}.zip`);
            this.router.navigate(['reports/download']);
          }
        },
        err => {
          this._rbs.compilingReport = false;
          this.errorService.handleServerError('Failed to retrieve zip file', err, () => console.log(err))
        });
  }

  adjustZoom(amount) {
    this.zoom += amount;
  }

}
