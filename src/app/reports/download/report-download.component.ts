import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ReportBuilderService } from '../services/report-builder.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'mds-download',
  templateUrl: './report-download.component.html',
  styleUrls: ['./report-download.component.css']
})
export class ReportDownloadComponent implements OnInit {

  constructor(public _location: Location,
              public rbs: ReportBuilderService,
              public snackBar: MatSnackBar,
              private router: Router) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    if (!this.rbs.getReportTableData()) {
      this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 5000});
      this.router.navigate(['reports']);
    }
  }

  startOver() {
    this.router.navigate(['reports'])
  }

}
