import { Component, OnInit } from '@angular/core';
import { ReportBuilderService } from '../services/report-builder.service';
import { ReportData } from '../../models/report-data';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder } from '@angular/forms';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { StoreService } from '../../core/services/store.service';
import { finalize, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { XlsToModelParserService } from '../services/xls-to-model-parser.service';
import { Router } from '@angular/router';
import { StoreListItem } from '../../models/store-list-item';
import { MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { DataFieldInfoDialogComponent } from '../../shared/data-field-info-dialog/data-field-info-dialog.component';

@Component({
  selector: 'mds-report-model-data',
  templateUrl: './report-model-data.component.html',
  styleUrls: ['../shared-report-style.css', './report-model-data.component.css'],
  providers: [XlsToModelParserService]
})
export class ReportModelDataComponent implements OnInit {

  savedModelsObs: Observable<{ modelName: string; timeStamp: number; updated: number; }[]>;

  parsingFile = false;
  postProcessing = false;

  constructor(private _rbs: ReportBuilderService,
              private fb: FormBuilder,
              private router: Router,
              private xlsToModelParserService: XlsToModelParserService,
              private storeService: StoreService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) {
  }

  get maxSavedModels() {
    return this._rbs.MAX_SAVED_MODELS;
  }

  get modelFileName() {
    return this._rbs.modelFileName;
  }

  get modelMetaDataForm() {
    return this._rbs.modelMetaDataForm;
  }

  ngOnInit() {
    this.savedModelsObs = this._rbs.getSavedModels();
  }

  showSavedModelInfoWindow() {
    this.dialog.open(DataFieldInfoDialogComponent, {
      data: {
        title: 'Saving Models', message: 'The ' + this.maxSavedModels + ' most ' +
          'recent models will be saved automatically. This allows you to refresh your browser at any point and your progress will be ' +
          'saved. WARNING: Only the ' + this.maxSavedModels + ' most recently created models will be saved. If one you want to preserve ' +
          'is getting near the bottom of the list you\'ll want to delete others!'
      }, maxWidth: '300px'
    });
  }

  confirmDelete(savedModel) {
    const data = {
      title: 'Delete saved model?',
      question: 'Are you sure you wish to delete the model: ' + savedModel.modelName + '?',
      options: ['Delete']
    };
    this.dialog.open(ConfirmDialogComponent, {data: data}).afterClosed()
      .subscribe(result => {
        if (result === 'Delete') {
          this._rbs.deleteSavedModel(savedModel).subscribe(() => {
            this.snackBar.open('Successfully deleted model', null, {duration: 2000});
          }, err => console.error(err));
        }
      });
  }

  loadSavedModel(modelName) {
    this._rbs.loadModel(modelName).subscribe(() => {
      this.snackBar.open('Successfully loaded model!', null, {duration: 2000});
    }, err => {
      this.snackBar.open(err, 'Close');
    });
  }

  fileIsReady() {
    return this._rbs.modelMetaDataForm.valid &&
      this._rbs.getReportTableData() &&
      !this.parsingFile &&
      !this.postProcessing;
  }

  openFile(event) {
    const files = event.target.files;

    if (files && files.length === 1) {
      // only want 1 file at a time!
      const file = files[0];
      if (file.name.includes('.xls')) {
        this._rbs.modelFileName = file.name;
        const modelName = file.name.replace(/\.[^.]+$/, '');
        this._rbs.modelMetaDataForm.get('modelName').setValue(modelName);
        this.readFile(file);
      } else {
        this.snackBar.open('Only valid .xls or .xlsx files are accepted', null, {duration: 2000});
      }
    } else {
      // notify about file constraints
      this.snackBar.open('1 file at a time please', null, {duration: 2000});
    }
  }

  next() {
    this._rbs.saveModel();
    this.router.navigate(['reports/categorization']);
  }

  private readFile(file: File) {
    const fileReader = new FileReader();

    // Triggered by readAsBinaryString() below
    fileReader.onload = () => {
      if (fileReader.result) {
        this.parsingFile = true;
        this.xlsToModelParserService.parseXls(fileReader.result)
          .pipe(finalize(() => this.parsingFile = false))
          .subscribe((reportData: ReportData) => {
            this.postProcessing = true;
            this.postProcessReportData(reportData)
              .pipe(finalize(() => this.postProcessing = false))
              .subscribe(() => this._rbs.setReportTableData(reportData));
          }, err => {
            this.dialog.open(ErrorDialogComponent, {data: {message: 'Failed to parse html file!', reason: err.toString()}});
          });
      } else {
        this.dialog.open(ErrorDialogComponent, {data: {message: 'Error Reading file! No result!'}});
      }
    };
    fileReader.readAsBinaryString(file); // Triggers FileReader.onload
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
    });
  }

  private setStoreListItemCategories(reportData: ReportData) {
    const target = reportData.storeList.filter(s => s.mapKey === reportData.selectedMapKey)[0];

    reportData.storeList.forEach(storeListItem => {
      if (storeListItem.scenario === 'Exclude') {
        storeListItem.category = 'Do Not Include';
      } else if (storeListItem.bannerName === target.bannerName) {
        storeListItem.category = 'Company Store';
      } else if (storeListItem.scenario === 'Existing' || storeListItem.scenario === 'Closed') {
        storeListItem.category = 'Existing Competition';
      } else if (storeListItem.scenario === 'Opening') {
        storeListItem.category = 'Proposed Competition';
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
