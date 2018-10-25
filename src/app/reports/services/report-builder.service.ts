import { Injectable } from '@angular/core';
import { ReportData } from '../../models/report-data';
import { Subject } from 'rxjs';
import { JsonToTablesUtil } from '../report-tables/json-to-tables.util';

@Injectable({
  providedIn: 'root'
})
export class ReportBuilderService {

  reportTableData: ReportData;
  reportMetaData;
  siteEvaluationData;

  jsonToTablesUtil: JsonToTablesUtil;

  next$: Subject<void> = new Subject();

  compilingImages = false;

  constructor() {
  }

  setReportTableData(reportData: ReportData) {
    this.reportTableData = reportData;
  }

  setSiteEvaluationData(siteEvalData) {
    this.siteEvaluationData = siteEvalData;
  }

  generateTables() {
    this.next$.next();
  }

}