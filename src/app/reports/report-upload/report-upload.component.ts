import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatStepper } from '@angular/material';
import { AuthService } from '../../core/services/auth.service';

import { HtmlToModelParser } from '../../core/services/html-to-model-parser.service';
import { HtmlDimensionsService } from '../../core/services/html-dimensions.service';

import { JsonToTablesService } from '../services/json-to-tables.service';

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
    public jsonToTablesService: JsonToTablesService,
    public auth: AuthService,
    public reportBuilderService: ReportBuilderService
  ) {
  }

  ngOnInit() {
    this.reportBuilderService.next$.subscribe(() => this.ngZone.run(() => this.stepper.next()));
  }

  clearFileInput() {
    document.getElementById('fileInput')['value'] = null;
  }

  generateTables() {
    console.log('GENERATE TABLES');

    this.jsonToTablesService.showedSnackbar = false;
    this.jsonToTablesService.init(this.reportBuilderService);
    this.stepper.next();
  }

}
