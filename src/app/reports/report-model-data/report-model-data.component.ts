import { Component, OnInit } from '@angular/core';
import { ReportBuilderService } from '../services/report-builder.service';
import { ReportData } from '../../models/report-data';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { StoreService } from '../../core/services/store.service';
import { finalize, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { XlsToModelParserService } from '../services/xls-to-model-parser.service';
import { Router } from '@angular/router';
import { StoreListItem } from '../../models/store-list-item';

@Component({
  selector: 'mds-report-model-data',
  templateUrl: './report-model-data.component.html',
  styleUrls: ['./report-model-data.component.css'],
  providers: [XlsToModelParserService]
})
export class ReportModelDataComponent implements OnInit {

  parsingFile = false;
  postProcessing = false;

  fileReader: FileReader;

  constructor(public rbs: ReportBuilderService,
              private fb: FormBuilder,
              private router: Router,
              private xlsToModelParserService: XlsToModelParserService,
              private storeService: StoreService,
              private snackBar: MatSnackBar) {
    this.fileReader = new FileReader();
  }

  ngOnInit() {
  }

  readFile(event) {
    this.rbs.modelFile = null;

    const files = event.target.files;

    if (files && files.length === 1) {
      // only want 1 file at a time!
      if (files[0].name.includes('.xls')) {
        this.rbs.modelFile = files[0];
      } else {
        this.snackBar.open('Only valid .xls or .xlsx files are accepted', null, {
          duration: 2000
        });
      }
    } else {
      // notify about file constraints
      this.snackBar.open('1 file at a time please', null, {duration: 2000});
    }

    this.fileReader.onload = () => {
      if (this.fileReader.result) {
        this.parsingFile = true;
        this.xlsToModelParserService.parseXls(this.fileReader.result)
        // this.htmlReportToJsonService.parseHtml(this.fileReader.result)
          .pipe(finalize(() => this.parsingFile = false))
          .subscribe((reportData: ReportData) => {
            this.postProcessing = true;
            this.postProcessReportData(reportData)
              .pipe(finalize(() => this.postProcessing = false))
              .subscribe(() => this.rbs.setReportTableData(reportData));
          }, err => {
            console.error(err);
            this.snackBar.open('Failed to parse html file!', 'Close')
          });
      } else {
        this.snackBar.open('Error Reading file! No result!', null, {duration: 5000});
      }
    };
    this.fileReader.onerror = error => this.snackBar.open(error.toString(), null, {duration: 2000});
    this.fileReader.readAsBinaryString(this.rbs.modelFile); // Triggers FileReader.onload
  }

  next() {
    this.router.navigate(['reports/categorization']);
  }

  private postProcessReportData(reportData: ReportData): Observable<any> {
    this.extractCompetitiveChanges(reportData);
    this.setStoreListItemCategories(reportData);
    this.calculateContributions(reportData);
    return this.updateStoreTotalAreas(reportData);
  }

  private calculateContributions(reportData: ReportData) {
    reportData.storeList.forEach((store: StoreListItem) => {
      const {storeBeforeSiteOpen, storeAfterSiteOpen} = this.getSovBeforeAndAfterStores(store, reportData);
      store['tradeAreaChange'] = storeBeforeSiteOpen.taChange - storeAfterSiteOpen.taChange;
      store['totalChange'] = storeBeforeSiteOpen.futureSales - storeAfterSiteOpen.futureSales;
      if (storeBeforeSiteOpen.futureSales && storeBeforeSiteOpen.futureSales !== 0) {
        store['tradeAreaChangePerc'] = store['tradeAreaChange'] / storeBeforeSiteOpen.futureSales;
        store['totalChangePerc'] = store['totalChange'] / storeBeforeSiteOpen.futureSales;
      } else {
        store['tradeAreaChangePerc'] = null;
        store['totalChangePerc'] = null;
      }
    });
  }

  private getSovBeforeAndAfterStores(store: StoreListItem, reportData: ReportData) {
    const beforeMatch = reportData.projectedVolumesBefore.find(j => j.mapKey === store.mapKey);
    const afterMatch = reportData.projectedVolumesAfter.find(j => j.mapKey === store.mapKey);
    return {storeBeforeSiteOpen: beforeMatch, storeAfterSiteOpen: afterMatch};
  }

  private extractCompetitiveChanges(reportData: ReportData) {
    const exclusions = reportData.projectedVolumesAfter
      .filter(volumeItem => volumeItem.salesArea === null && volumeItem.currentSales === 0 && volumeItem.futureSales === null)
      .map(volumeItem => volumeItem.mapKey);

    const closures = reportData.projectedVolumesAfter
      .filter(volumeItem => volumeItem.currentSales !== 0 && volumeItem.futureSales === null &&
        volumeItem.mapKey !== reportData.selectedMapKey && !exclusions.includes(volumeItem.mapKey))
      .map(volumeItem => volumeItem.mapKey);

    const openings = reportData.projectedVolumesAfter
      .filter(volumeItem => volumeItem.currentSales === 0 && volumeItem.futureSales !== null &&
        volumeItem.mapKey !== reportData.selectedMapKey && !exclusions.includes(volumeItem.mapKey))
      .map(volumeItem => volumeItem.mapKey);

    reportData.storeList.forEach(storeListItem => {
      if (storeListItem.mapKey === reportData.selectedMapKey) {
        storeListItem.scenario = 'Site';
      } else if (exclusions.includes(storeListItem.mapKey)) {
        storeListItem.scenario = 'Exclude';
      } else if (closures.includes(storeListItem.mapKey)) {
        storeListItem.scenario = 'Closed';
      } else if (openings.includes(storeListItem.mapKey)) {
        storeListItem.scenario = 'Opening';
      } else {
        storeListItem.scenario = 'Existing';
      }
    })
  }

  private setStoreListItemCategories(reportData: ReportData) {
    const target = reportData.storeList.filter(s => s.mapKey === reportData.selectedMapKey)[0];

    reportData.storeList.forEach(storeListItem => {
      if (storeListItem.scenario === 'Exclude') {
        storeListItem.category = 'Do Not Include';
      } else if (storeListItem.scenario === 'Existing' || storeListItem.scenario === 'Closed') {
        storeListItem.category = 'Existing Competition';
      } else if (storeListItem.scenario === 'Opening') {
        storeListItem.category = 'Proposed Competition';
      } else if (storeListItem.bannerName === target.bannerName) {
        storeListItem.category = 'Company Store';
      }
    });
  }

  private updateStoreTotalAreas(reportData: ReportData) {
    const storeIds = reportData.storeList
      .filter(s => s.uniqueId)
      .map(s => s.uniqueId);

    return this.storeService.getAllByIds(storeIds)
      .pipe(tap((stores: SimplifiedStore[]) => {
          stores.forEach((store: SimplifiedStore) => {
            reportData.storeList.filter(s => s.uniqueId === store.id).forEach(s => {
              s.totalArea = Math.round(store.areaTotal / 100) * 100;
              if (store.banner) {
                s.bannerName = store.banner.bannerName;
              }
            });
          });
        },
        () => {
          const message = 'Failed to retrieve total area from database!';
          this.snackBar.open(message, 'OK', {duration: 15000});
        }
      ));
  }

}
