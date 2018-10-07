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

  @ViewChild('stepper') stepper: MatStepper;

  constructor(
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private htmlReportToJsonService: HtmlToModelParser,
    private htmlDimensionsService: HtmlDimensionsService,
    public jsonToTablesService: JsonToTablesService,
    public auth: AuthService,
    public reportBuilderService: ReportBuilderService
  ) {
  }

  ngOnInit() {
    this.reportBuilderService.reportDataLoaded$.subscribe(() => this.ngZone.run(() => this.stepper.next()))
  }

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
  }

  changeCategory(event, mapKey) {
    const idx: number = this.reportBuilderService.reportTableData.storeList.findIndex(
      s => s.mapKey === mapKey
    );
    if (idx !== -1) {
      this.reportBuilderService.reportTableData.storeList[idx].category = event.target.value;
      console.log(this.reportBuilderService.reportTableData.storeList[idx]);
    }
  }

  changeCombinedCategory(event, combo) {
    console.log(combo, ' change to ', event.target.value);
    this.reportBuilderService.reportTableData.storeList.forEach((s, i) => {
      if (s.storeName === combo.storeName && s.uniqueId) {
        this.reportBuilderService.reportTableData.storeList[i].category = event.target.value;
      }
    });
  }

  getExistingStoresCount(storeName) {
    return this.reportBuilderService.reportTableData.storeList.filter(
      s => s.storeName === storeName && s.uniqueId
    ).length;
  }

  getExistingStoresCombined() {
    return this.reportBuilderService.reportTableData.storeList
      .filter(s => s.uniqueId !== null)
      .map(s => {
        return { storeName: s.storeName, category: s.category };
      })
      .filter((elem, idx, arr) => {
        return arr.findIndex(e => e.storeName === elem.storeName) === idx;
      });
  }

  getProposedStores() {
    return this.reportBuilderService.reportTableData.storeList.filter(s => s.uniqueId === null);
  }

  clearFileInput() {
    document.getElementById('htmlFileInput')['value'] = null;
  }

  generateTables() {
    console.log('GENERATE TABLES');

    this.jsonToTablesService.showedSnackbar = false;
    this.jsonToTablesService.init(this.reportBuilderService.reportMetaData, this.reportBuilderService.reportTableData, this.descriptions);
    this.stepper.next();
  }

}
