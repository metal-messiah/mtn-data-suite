import { Component, OnInit } from '@angular/core';
import { ReportBuilderService } from '../services/report-builder.service';
import { ReportData } from '../../models/report-data';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { StoreService } from '../../core/services/store.service';
import { finalize, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { XlsToModelParserService } from '../../core/services/xls-to-model-parser.service';

@Component({
  selector: 'mds-report-model-data',
  templateUrl: './report-model-data.component.html',
  styleUrls: ['./report-model-data.component.css']
})
export class ReportModelDataComponent implements OnInit {

  parsingFile = false;
  postProcessing = false;

  modelMetaDataForm: FormGroup;

  file: File;
  reportData: ReportData;

  fileReader: FileReader;

  constructor(public reportBuilderService: ReportBuilderService,
              private fb: FormBuilder,
              private auth: AuthService,
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
      type: 'test',
      modelName: 'test',
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
        this.snackBar.open('Only valid .xls files are accepted', null, {
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
    this.reportData = null;
  }

  submitModelData() {
    this.reportBuilderService.reportMetaData = this.modelMetaDataForm.value;
    this.fileReader.onload = () => {
      if (this.fileReader.result) {
        this.parsingFile = true;
        this.xlsToModelParserService.parseXls(this.fileReader.result);
        // this.htmlReportToJsonService.parseHtml(this.fileReader.result)
        //   .pipe(finalize(() => this.parsingHtml = false))
        //   .subscribe((reportData: ReportData) => {
        //     this.postProcessing = true;
        //     this.postProcessReportData(reportData)
        //       .pipe(finalize(() => {
        //         this.postProcessing = false;
        //         this.reportBuilderService.setReportTableData(reportData);
        //       }))
        //       .subscribe();
        //   }, err => {
        //     console.error(err);
        //     this.snackBar.open('Failed to parse html file!', 'Close')
        //   });
      } else {
        this.snackBar.open('Error Reading file! No result!', null, {duration: 5000});
      }
    };
    this.fileReader.onerror = error => this.snackBar.open(error.toString(), null, {duration: 2000});
    this.fileReader.readAsBinaryString(this.file); // Triggers FileReader.onload
  }

  private postProcessReportData(reportData: ReportData): Observable<any> {
    this.setStoreListItemCategories(reportData);
    return this.updateStoreTotalAreas(reportData);
  }

  private setStoreListItemCategories(reportData: ReportData) {
    const target = reportData.storeList.filter(s => s.mapKey === reportData.selectedMapKey)[0];

    reportData.storeList.forEach(storeListItem => {
      if (storeListItem.mapKey === target.mapKey || storeListItem.storeName === target.storeName) {
        storeListItem.category = 'Company Store';
      } else if (storeListItem.uniqueId) {
        storeListItem.category = 'Existing Competition';
      } else {
        storeListItem.category = 'Do Not Include';
      }
    })
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
              reportData.storeList[idx].totalArea = store.areaTotal;
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
