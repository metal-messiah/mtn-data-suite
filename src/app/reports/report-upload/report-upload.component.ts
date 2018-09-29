import { Component, NgZone, OnInit, ViewChild, Inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatSnackBar, MatStepper } from "@angular/material";
import { debounceTime, finalize, tap } from "rxjs/internal/operators";
import { AuthService } from "../../core/services/auth.service";
import * as _ from "lodash";

import { HtmlReportToJsonService } from '../../core/services/html-report-to-json.service';
import { HtmlDimensionsService } from '../../core/services/html-dimensions.service';
import { HTMLasJSON } from '../../models/html-as-json';

import { ReportUploadInterface } from './report-upload-interface';
import { StoreListItem } from '../../models/store-list-item';

import htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';
import jsZip from 'jszip';

import { JsonToTablesService } from './json-to-tables.service';

import { HttpClient } from '@angular/common/http';
import { RestService } from '../../core/services/rest.service';

@Component({
  selector: 'mds-report-upload',
  templateUrl: './report-upload.component.html',
  styleUrls: ['./report-upload.component.css'],
  providers: [
    HtmlReportToJsonService,
    JsonToTablesService,
    HtmlDimensionsService
  ]
})
export class ReportUploadComponent implements OnInit {
  htmlFile: File;
  htmlAsString: String;
  htmlAsJson: HTMLasJSON;

  exportPromises: Promise<any>[] = [];
  exportData: Blob;

  mapImage: string;

  tableDomIds: string[] = [
    'projectionsTable',
    'currentStoresWeeklySummaryTable',
    'projectedStoresWeeklySummaryTable',
    'sourceOfVolumeTable',
    'mapImage'
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
    'Proposed Competition',
    'Do Not Include'
  ];

  constructor(
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private htmlReportToJsonService: HtmlReportToJsonService,
    private htmlDimensionsService: HtmlDimensionsService,
    private jsonToTablesService: JsonToTablesService,
    private http: HttpClient,
    private rest: RestService,
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
      type: 'New',
      siteNumber: '1000.1',
      modelName: 'Jacksonville FL 18 Kitson',
      fieldResDate: new Date()
    };
  }

  ngOnInit() {}

  toggleBasemap(type) {
    const base = type === 'sat' ? 'hybrid' : 'roadmap';
    this.mapImage = this.mapImage
      .replace('hybrid', base)
      .replace('roadmap', base);
  }

  getCurrentBasemap() {
    if (this.mapImage.includes('roadmap')) {
      return 'road';
    } else {
      return 'sat';
    }
  }

  getMapImage() {
    // map image
    const target = this.jsonToTablesService.getTargetStore();
    const { latitude, longitude, storeName } = target;
    console.log(latitude, longitude, storeName);

    this.mapImage = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=16&size=470x350&maptype=hybrid&markers=color:red%7Clabel:${
      storeName[0]
    }%7C${latitude},${longitude}&key=AIzaSyBwCet-oRMj-K7mUhd0kcX_0U1BW-xpKyQ`;
  }

  export() {
    this.compilingImages = true;
    // convert tables to images
    this.tableDomIds.forEach(id => {
      const node = document.getElementById(id);
      this.exportPromises.push(htmlToImage.toBlob(node));
    });

    Promise.all(this.exportPromises)
      .then(data => {
        this.compilingImages = false;
        console.log(data);
        const zip = new jsZip();
        // table images
        data.forEach((fileData, i) => {
          zip.file(`${this.tableDomIds[i]}.png`, fileData);
        });

        zip.generateAsync({ type: 'blob' }).then(blob => {
          saveAs(
            blob,
            `${
              this.inputData.modelName
                ? this.inputData.modelName
                : 'MTNRA_Reports_Export'
            }.zip`
          );
        });

        // saveAs(data, 'test.png')
      })
      .catch(error => {
        this.compilingImages = false;
        this.snackBar.open(error, null, { duration: 2000 });
        console.log(false);
      });
  }

  getFirstYearAsNumber() {
    return (
      2000 +
      Number(this.htmlAsJson.firstYearEndingMonthYear.trim().split(' ')[1])
    );
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

  resetFile() {
    console.log('RESET FILE');
    this.htmlFile = null;
    this.htmlAsString = null;
    this.htmlAsJson = null;
  }

  readFile(event) {
    this.resetFile();

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
    }
  }

  convertHtmlToJson(form) {
    this.inputData = form.value;
    this.compilingJson = true;
    this.htmlReportToJsonService.convertHTMLtoJSON(
      this.htmlAsString,
      this.inputData
    );
  }

  handleHtmlAsJson(htmlAsJson) {
    this.compilingJson = false;
    this.htmlAsJson = htmlAsJson;

    console.log(htmlAsJson);
    // this.generateTables();
  }

  generateTables() {
    console.log('GENERATE TABLES');

    this.jsonToTablesService.init(this.inputData, this.htmlAsJson);
    this.getMapImage();
    // this.tableJson = this.jsonToTablesService.generateTables(
    //   this.inputData,
    //   this.htmlAsJson
    // );
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
