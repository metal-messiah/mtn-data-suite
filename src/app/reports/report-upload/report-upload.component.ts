import { Component, NgZone, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar, MatStepper } from '@angular/material';
import { debounceTime, finalize, tap } from 'rxjs/internal/operators';
import { AuthService } from '../../core/services/auth.service';
import * as _ from 'lodash';

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
  googleMapsKey = 'AIzaSyBwCet-oRMj-K7mUhd0kcX_0U1BW-xpKyQ';
  googleMapsBasemap = 'hybrid';
  googleMapsZoom = 15;

  tableDomIds: string[] = [
    'projectionsTable',
    'currentStoresWeeklySummaryTable',
    'projectedStoresWeeklySummaryTable',
    'sourceOfVolumeTable',
    'mapImage',
    'descriptionsRatings'
  ];

  fileReader: FileReader;
  inputData: ReportUploadInterface;
  stepper: MatStepper;
  compilingJson: Boolean = false;
  compilingImages: Boolean = false;

  interface: ReportUploadInterface;

  descriptions: {
    streetConditions: string;
    comments: string;
    trafficControls: string;
    cotenants: string;
    access: {
      north: string;
      east: string;
      south: string;
      west: string;
    };
    ingressEgress: string;
    visibility: {
      north: string;
      east: string;
      south: string;
      west: string;
    };
    populationDensity: {
      north: string;
      east: string;
      south: string;
      west: string;
    };
  };

  categories: string[] = [
    'Company Store',
    'Existing Competition',
    'Proposed Competition',
    'Do Not Include'
  ];

  groupOptions: string[] = ['Excellent', 'Good', 'Average', 'Fair', 'Poor'];

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

  handleDescriptionsForm(form) {
    this.descriptions = {
      streetConditions: form.value.streetConditions,
      comments: form.value.comments,
      trafficControls: form.value.trafficControls,
      cotenants: form.value.cotenants,
      access: {
        north: form.value.accessNorth,
        east: form.value.accessEast,
        south: form.value.accessSouth,
        west: form.value.accessWest
      },
      ingressEgress: form.value.ingressEgress,
      visibility: {
        north: form.value.visibilityNorth,
        east: form.value.visibilityEast,
        south: form.value.visibilitySouth,
        west: form.value.visibilityWest
      },
      populationDensity: {
        north: form.value.populationDensityNorth,
        east: form.value.populationDensityEast,
        south: form.value.populationDensitySouth,
        west: form.value.populationDensityWest
      }
    };
    console.log(this.descriptions)
  }

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

  getMapImage(basemap?: string, zoom?: number) {
    if (basemap) {
      this.googleMapsBasemap = basemap;
    }
    if (zoom) {
      this.googleMapsZoom = this.googleMapsZoom - zoom;
    }
    // map image
    const target = this.jsonToTablesService.getTargetStore();
    const stores = this.jsonToTablesService.getProjectedStoresWeeklySummary();

    const storePins = stores
      .map(s => {
        if (s.latitude && s.longitude) {
          const isTarget = s.mapKey === target.mapKey;
          const color = isTarget
            ? 'red'
            : s.category === 'Company Store'
              ? 'blue'
              : 'yellow';
          return `&markers=color:${color}%7Clabel:${
            isTarget ? s.storeName[0] : ''
          }%7C${s.latitude},${s.longitude}`;
        }
      })
      .join('');

    const { latitude, longitude, storeName } = target;
    // console.log(latitude, longitude, storeName);

    this.mapImage = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${
      this.googleMapsZoom
    }&size=470x350&maptype=${this.googleMapsBasemap}&${storePins}&key=${
      this.googleMapsKey
    }`;
  }

  compileCSVFromTextBoxes() {
    // A generated list of the stores they marked as Company stores in step 2, one per row. Sort Alphabetically and then by Map Key
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


        const sisterStoreAffects = this.jsonToTablesService
          .getStoresForExport('Company Store')
          .sort((a, b) => {
            if (a.storeName === b.storeName) {
              return Number(a.mapKey) - Number(b.mapKey);
            } else {
              return a.storeName < b.storeName ? -1 : 1;
            }
          })
          .map(store => `${store.storeName} ${store.mapKey}`)
          .join('\r\n');

        const txt = `Street Conditions\r\n${
          this.descriptions.streetConditions
        }\r\n\r\nComments\r\n${
          this.descriptions.comments
        }\r\n\r\nTraffic Controls\r\n${
          this.descriptions.streetConditions
        }\r\n\r\nCo-tenants\r\n${
          this.descriptions.cotenants
        }\r\n\r\nSister Store Affects\r\n${
          sisterStoreAffects
        }`;

        zip.file(`descriptions.txt`, new Blob([txt]));

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

    this.jsonToTablesService.showedSnackbar = false;
    this.jsonToTablesService.init(this.inputData, this.htmlAsJson);
    this.getMapImage();
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
