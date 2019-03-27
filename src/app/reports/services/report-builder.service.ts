import { Injectable } from '@angular/core';
import { ReportData } from '../../models/report-data';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { RestService } from '../../core/services/rest.service';
import { AuthService } from '../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class ReportBuilderService {

  protected readonly endpoint = '/api/report';

  private reportTableData: ReportData;

  modelFile: File;

  dataVerifcationForm: FormGroup;
  siteEvaluationNarrativeForm: FormGroup;
  siteEvaluationRatingsForm: FormGroup;
  modelMetaDataForm: FormGroup;

  compilingReport = false;

  constructor(protected http: HttpClient,
              private fb: FormBuilder,
              protected rest: RestService,
              private authService: AuthService) {
    this.createForms();
  }

  public getReportTableData() {
    return this.reportTableData;
  }

  private createForms() {
    this.siteEvaluationNarrativeForm = this.fb.group({
      executiveSummary: '',
      scenario: '',
      assumedPower: '',
      competitiveChanges: '',
      streetConditions: '',
      comments: '',
      trafficControls: '',
      cotenants: '',
      affectedSisterStores: ''
    });
    this.siteEvaluationRatingsForm = this.fb.group({
      accessNorth: 'Average',
      accessSouth: 'Average',
      accessEast: 'Average',
      accessWest: 'Average',
      ingressEgress: 'Average',
      visibilityNorth: 'Average',
      visibilitySouth: 'Average',
      visibilityEast: 'Average',
      visibilityWest: 'Average',
      populationDensityNorth: 'Average',
      populationDensitySouth: 'Average',
      populationDensityEast: 'Average',
      populationDensityWest: 'Average'
    });
    this.modelMetaDataForm = this.fb.group({
      analyst: `${this.authService.sessionUser.firstName} ${this.authService.sessionUser.lastName}`,
      clientName: ['', [Validators.required]],
      type: ['', [Validators.required]],
      modelName: ['', [Validators.required]],
      fieldResDate: new Date()
    });
  }

  setReportTableData(reportData: ReportData) {
    this.reportTableData = reportData;
    this.dataVerifcationForm = this.fb.group({
      stores: this.fb.array(this.reportTableData.storeList
        .map(si => {
          const group = this.fb.group(si);
          group.get('totalArea').setValidators([Validators.required, Validators.min(0)]);
          return group;
        }))
    });
  }

  getReportMetaData() {
    return this.modelMetaDataForm.value;
  }

  getSiteEvaluationNarrative() {
    return this.siteEvaluationNarrativeForm.value;
  }

  getSiteEvaluationRatings() {
    return this.siteEvaluationRatingsForm.value;
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
