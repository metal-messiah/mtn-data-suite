import { Component, NgZone, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar, MatStepper } from '@angular/material';
import { debounceTime, finalize, tap } from 'rxjs/internal/operators';
import { AuthService } from '../../core/services/auth.service';
import * as _ from 'lodash';

import { HtmlReportToJsonService } from '../../core/services/html-report-to-json.service';
import { HTMLasJSON } from '../../models/html-as-json';

import { ReportUploadInterface } from './report-upload-interface';
import { StoreListItem } from '../../models/store-list-item';

import htmlToImage from 'html-to-image';

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
  tableImageUrls: string[];
  tableDomIds: string[] = [
    'projectionsTable',
    'currentStoresWeeklySummaryTable',
    'projectedStoresWeeklySummaryTable',
    'sourceOfVolumeTable'
  ];

  tableJson: {
    targetStore: object;
    projectionsTable: object;
    currentStoresWeeklySummary: object[];
    projectedStoresWeeklySummary: object[];
    sourceOfVolume: {
      companyStores: object[];
      existingCompetition: object[];
      proposedCompetition: object[];
    };
  };

  fileReader: FileReader;
  inputData: ReportUploadInterface;
  stepper: MatStepper;
  compilingJson: Boolean = false;
  compilingImages: Boolean = false;

  interface: ReportUploadInterface;

  categories: string[] = [
    'Company Store',
    'Existing Competition',
    'Proposed Competition'
  ];

  constructor(
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private htmlReportToJsonService: HtmlReportToJsonService,
    public auth: AuthService
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

    this.interface = {
      analyst: `${this.auth.sessionUser.firstName} ${
        this.auth.sessionUser.lastName
      }`,
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
      opens: new Date().getFullYear(),
      demographicDataYear: new Date().getFullYear(),
      inflationRate: null,
      secondYearAcceptance: null,
      thirdYearAcceptance: null
    };
  }

  ngOnInit() {}

  saveAsImage() {
    this.compilingImages = true;
    this.tableImageUrls = [];
    this.tableDomIds.forEach(id => {
      const node = document.getElementById(id);

      htmlToImage
        .toPng(node)
        .then(dataUrl => {
          this.compilingImages = false;
          this.tableImageUrls.push(dataUrl);
        })
        .catch(error => {
          this.compilingImages = false;
          this.snackBar.open(error, null, { duration: 2000 });
        });
    });
  }

  changeCategory(event, mapKey) {
    const idx: number = this.htmlAsJson.storeList.findIndex(
      s => s.mapKey === mapKey
    );
    if (idx !== -1) {
      this.htmlAsJson.storeList[idx].category = event.target.value;
      console.log(this.htmlAsJson.storeList[idx]);
    }
  }

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

      this.compilingJson = true;
      this.htmlReportToJsonService.convertHTMLtoJSON(
        this.htmlAsString,
        this.inputData
      );
    }
  }

  handleHtmlAsJson(htmlAsJson) {
    this.compilingJson = false;
    this.htmlAsJson = htmlAsJson;
    console.log(htmlAsJson);
    // this.generateTables();
  }

  generateTables() {
    console.log('GENERATE TABLES');
    this.tableImageUrls = [];
    this.tableJson = this.htmlReportToJsonService.generateTables(
      this.inputData,
      this.htmlAsJson
    );
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
