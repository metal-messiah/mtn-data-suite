import { Injectable } from '@angular/core';
import { ReportData } from '../../models/report-data';
import { HttpClient } from '@angular/common/http';
import { RestService } from '../../core/services/rest.service';

@Injectable()
export class ReportBuilderService {

  protected endpoint = '/api/report';

  reportTableData: ReportData;
  reportMetaData;
  siteEvaluationNarrative;
  siteEvaluationRatings;

  compilingImages = false;

  constructor(protected http: HttpClient, protected rest: RestService) {
  }

  setReportTableData(reportData: ReportData) {
    this.reportTableData = reportData;
  }

  setSiteEvaluationNarrative(siteEvalNarrative) {
    this.siteEvaluationNarrative = siteEvalNarrative;
  }

  setSiteEvaluationRatings(siteEvalRatings) {
    this.siteEvaluationRatings = siteEvalRatings;
  }

  getReportZip(reportData: any) {
    const url = this.rest.getHost() + this.endpoint + `/zip`;
    return this.http.post(url, reportData, {headers: this.rest.getHeaders(), responseType: 'blob'});
  }

}
