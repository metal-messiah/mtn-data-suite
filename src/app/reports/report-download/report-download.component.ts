import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportBuilderService } from '../services/report-builder.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'mds-download',
  templateUrl: './report-download.component.html',
  styleUrls: ['./report-download.component.css', '../shared-report-style.css']
})
export class ReportDownloadComponent implements OnInit {

  constructor(private _rbs: ReportBuilderService,
              private snackBar: MatSnackBar,
              private router: Router,
              private host: ElementRef) { }

  ngOnInit() {
    this.host.nativeElement.scrollTop = 0;
    if (!this._rbs.getReportTableData()) {
      this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 2000});
      this.router.navigate(['reports']);
    }
  }

  get rbs() {
    return this._rbs;
  }

  startOver() {
    this.router.navigate(['reports'], {replaceUrl: true})
  }

}
