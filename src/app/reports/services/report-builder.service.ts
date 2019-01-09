import { Injectable } from '@angular/core';
import { ReportData } from '../../models/report-data';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { RestService } from '../../core/services/rest.service';
import { AuthService } from '../../core/services/auth.service';

@Injectable()
export class ReportBuilderService {

  protected endpoint = '/api/report';

  reportTableData: ReportData;
  reportMetaData;
  siteEvaluationNarrative;
  siteEvaluationRatings;

  compilingReport = false;

  constructor(protected http: HttpClient, protected rest: RestService, private authService: AuthService) {
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
    const url = this.rest.getReportHost() + this.endpoint + `/zip`;
    let params = new HttpParams().set('report-name', reportName);
    params = params.set('user-id', this.authService.sessionUser.id.toString());
    return this.http.post(url, reportData, {params: params});
  }

  getReportZip(reportName: string) {
    const url = this.rest.getReportHost() + this.endpoint + `/zip`;
    let params = new HttpParams().set('report-name', reportName);
    params = params.set('user-id', this.authService.sessionUser.id.toString());
    return this.http.get(url, {params: params, observe: 'response', responseType: 'blob'});
  }

  getHTReport(reportData) {
    const url = this.rest.getNodeReportHost() + '/ht/report';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(url, reportData, {headers: headers, observe: 'response', responseType: 'blob'});
  }

}
