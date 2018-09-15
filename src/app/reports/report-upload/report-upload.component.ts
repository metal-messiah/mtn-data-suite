import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar, MatStepper } from '@angular/material';
import { debounceTime, finalize, tap } from 'rxjs/internal/operators';
import * as _ from 'lodash';

import { HtmlReportToJsonService } from '../../core/services/html-report-to-json.service';
import { HTMLasJSON } from '../../models/html-as-json';

import { ReportUploadInterface } from './report-upload-interface';

@Component({
  selector: 'mds-report-upload',
  templateUrl: './report-upload.component.html',
  styleUrls: ['./report-upload.component.css'],
  providers: [HtmlReportToJsonService]
})
export class ReportUploadComponent implements OnInit {
  htmlFile: File;
  htmlAsString: String;
  htmlAsJson: HTMLasJSON;
  fileReader: FileReader;
  inputData: ReportUploadInterface;
  stepper: MatStepper;

  interface: ReportUploadInterface = {
    analyst: '',
    retailerName: '',
    type: '',
    siteNumber: '',
    storeAddress: '',
    state: '',
    modelName: '',
    fieldResDate: new Date(),
    firstYearEndingMonthYear: new Date(),
    reportDate: new Date(),
    projectNumber: null,
    opens: null,
    demographicDataYear: null,
    inflationRate: null,
    secondYearAcceptance: null,
    thirdYearAcceptance: null
  };

  constructor(
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private htmlReportToJsonService: HtmlReportToJsonService
  ) {
    this.fileReader = new FileReader();
    this.fileReader.onload = event => this.handleFileContents(event); // desired file content
    this.fileReader.onerror = error =>
      this.snackBar.open(error.toString(), null, {
        duration: 2000
      });

    this.htmlReportToJsonService.output$.subscribe((htmlAsJson: HTMLasJSON) => {
      this.handleHtmlAsJson(htmlAsJson);
    });
  }

  ngOnInit() {}

  readFile(event, form) {
    this.inputData = form.value;
    const { files } = event.target;

    if (files && files.length === 1) {
      // only want 1 file at a time!
      this.htmlFile = files[0];
      if (this.htmlFile.name.includes('.html')) {
        // just double checking that it is a .html file
        this.fileReader.readAsText(this.htmlFile);
      } else {
        this.snackBar.open('Only valid .html files are accepted', null, {
          duration: 2000
        });
      }
    } else {
      // notify about file constraints
      this.snackBar.open('1 file at a time please', null, { duration: 2000 });
    }
  }

  validateForm() {}

  handleFileContents(event) {
    if (event.target.result) {
      this.htmlAsString = event.target.result;

      this.htmlReportToJsonService.convertHTMLtoJSON(this.htmlAsString);
    }
  }

  handleHtmlAsJson(htmlAsJson) {
    this.htmlAsJson = htmlAsJson;
    console.log(this.htmlAsJson, this.inputData);
  }

  stepForward() {
    setTimeout(() => this.stepper.next(), 250);
  }

  stepBackward() {
    setTimeout(() => this.stepper.previous(), 250);
  }

  resetStepper() {
    setTimeout(() => this.stepper.reset(), 250);
  }
}
