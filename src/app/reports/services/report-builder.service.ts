import { Injectable } from '@angular/core';
import { ReportData } from '../../models/report-data';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestService } from '../../core/services/rest.service';

@Injectable()
export class ReportBuilderService {

  protected endpoint = '/api/report';

  reportTableData: ReportData;
  reportMetaData;
  siteEvaluationNarrative;
  siteEvaluationRatings;

  complingReport = false;

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

  startReportBuilding(reportData: any, reportName: string) {
    const url = 'https://mtn-rest-service.herokuapp.com' + this.endpoint + `/zip`;
    const params = new HttpParams().set('report-name', reportName);
    return this.http.post(url, reportData, {headers: this.rest.getHeaders(), params: params});
  }

  getReportZip(reportName: string) {
    const url = 'https://mtn-rest-service.herokuapp.com' + this.endpoint + `/zip`;
    const params = new HttpParams().set('report-name', reportName);
    return this.http.get(url, {headers: this.rest.getHeaders(), params: params, observe: 'response', responseType: 'blob'});
  }

}
