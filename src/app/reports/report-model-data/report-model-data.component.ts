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

  modelMetaDataForm: FormGroup;

  file: File;

  fileReader: FileReader;

  constructor(public rbs: ReportBuilderService,
              private fb: FormBuilder,
              private auth: AuthService,
              private router: Router,
              private xlsToModelParserService: XlsToModelParserService,
              private storeService: StoreService,
              private snackBar: MatSnackBar) {
    this.fileReader = new FileReader();
    this.createForm();
  }

  ngOnInit() {
  }

  private createForm() {
    this.modelMetaDataForm = this.fb.group({
      analyst: `${this.auth.sessionUser.firstName} ${this.auth.sessionUser.lastName}`,
      clientName: ['', [Validators.required]],
      type: ['', [Validators.required]],
      modelName: ['', [Validators.required]],
      fieldResDate: new Date()
    })
  }

  readFile(event) {
    this.resetFile();

    const files = event.target.files;

    if (files && files.length === 1) {
      // only want 1 file at a time!
      if (files[0].name.includes('.xls')) {
        this.file = files[0];
      } else {
        this.snackBar.open('Only valid .xls or .xlsx files are accepted', null, {
          duration: 2000
        });
      }
    } else {
      // notify about file constraints
      this.snackBar.open('1 file at a time please', null, {duration: 2000});
    }
  }

  resetFile() {
    console.log('RESET FILE');
    this.file = null;
  }

  submitModelData() {
    this.rbs.reportMetaData = this.modelMetaDataForm.value;
    this.fileReader.onload = () => {
      if (this.fileReader.result) {
        this.parsingFile = true;
        this.xlsToModelParserService.parseXls(this.fileReader.result)
        // this.htmlReportToJsonService.parseHtml(this.fileReader.result)
          .pipe(finalize(() => this.parsingFile = false))
          .subscribe((reportData: ReportData) => {
            this.postProcessing = true;
            this.postProcessReportData(reportData)
              .pipe(finalize(() => {
                this.postProcessing = false;
                this.rbs.setReportTableData(reportData);
                this.router.navigate(['reports/categorization']);
              }))
              .subscribe();
          }, err => {
            console.error(err);
            this.snackBar.open('Failed to parse html file!', 'Close')
          });
      } else {
        this.snackBar.open('Error Reading file! No result!', null, {duration: 5000});
      }
    };
    this.fileReader.onerror = error => this.snackBar.open(error.toString(), null, {duration: 2000});
    this.fileReader.readAsBinaryString(this.file); // Triggers FileReader.onload
  }

  private postProcessReportData(reportData: ReportData): Observable<any> {
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

  private setStoreListItemCategories(reportData: ReportData) {
    const target = reportData.storeList.filter(s => s.mapKey === reportData.selectedMapKey)[0];

    reportData.storeList.forEach(storeListItem => {
      if (storeListItem.mapKey === target.mapKey || (storeListItem.storeName === target.storeName && storeListItem.mapKey % 1 === 0) ) {
        storeListItem.category = 'Company Store';
      } else if (storeListItem.uniqueId) {
        storeListItem.category = 'Existing Competition';
      } else {
        storeListItem.category = 'Do Not Include';
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
            const idx = reportData.storeList.findIndex(s => s.uniqueId === store.id);
            if (idx !== -1) {
              reportData.storeList[idx].totalArea = Math.round(store.areaTotal / 100) * 100;
            }
          });
        },
        () => {
          const message = 'Failed to retrieve total area from database!';
          this.snackBar.open(message, 'OK', {duration: 15000});
        }
      ));
  }

}
