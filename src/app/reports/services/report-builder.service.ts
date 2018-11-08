import { Injectable } from '@angular/core';
import { ReportData } from '../../models/report-data';
import { Subject } from 'rxjs';
import { JsonToTablesUtil } from '../report-tables/json-to-tables.util';

@Injectable()
export class ReportBuilderService {

  reportTableData: ReportData;
  reportMetaData;
  siteEvaluationNarrative;
  siteEvaluationRatings;

  compilingImages = false;

  setReportTableData(reportData: ReportData) {
    this.reportTableData = reportData;
  }

  setSiteEvaluationNarrative(siteEvalNarrative) {
    this.siteEvaluationNarrative = siteEvalNarrative;
  }

  setSiteEvaluationRatings(siteEvalRatings) {
    this.siteEvaluationRatings = siteEvalRatings;
  }

}
