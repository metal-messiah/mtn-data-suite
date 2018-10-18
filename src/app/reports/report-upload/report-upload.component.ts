import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatStepper } from '@angular/material';
import { AuthService } from '../../core/services/auth.service';

import { ReportBuilderService } from '../services/report-builder.service';

@Component({
  selector: 'mds-report-upload',
  templateUrl: './report-upload.component.html',
  styleUrls: ['./report-upload.component.css'],
})
export class ReportUploadComponent implements OnInit {

  @ViewChild('stepper') stepper: MatStepper;

  constructor(
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    public auth: AuthService,
    public rbs: ReportBuilderService
  ) {
  }

  ngOnInit() {
    this.rbs.next$.subscribe(() => this.ngZone.run(() => {
      this.stepper.next()
      window.scrollTo(0, 0);
    }));
  }

  clearFileInput() {
    document.getElementById('fileInput')['value'] = null;
  }

}
