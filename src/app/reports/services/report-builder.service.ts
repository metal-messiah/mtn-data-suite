import { Injectable } from '@angular/core';
import { ReportData } from '../../models/report-data';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportBuilderService {

  reportTableData: ReportData;
  reportMetaData;

  reportDataLoaded$: Subject<void> = new Subject();

  compilingImages = false;

  constructor() {
  }

  setReportTableData(reportData: ReportData) {
    this.reportTableData = reportData;
    this.reportDataLoaded$.next();
  }


}
