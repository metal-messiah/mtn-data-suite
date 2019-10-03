import { Injectable } from '@angular/core';
import { ReportData } from '../../models/report-data';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { RestService } from '../../core/services/rest.service';
import { AuthService } from '../../core/services/auth.service';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { debounce, finalize, map, mergeMap, tap } from 'rxjs/operators';
import { StorageService } from '../../core/services/storage.service';

import * as _ from 'lodash';
import { of, timer } from 'rxjs';

@Injectable()
export class ReportBuilderService {

  saving = false;

  private readonly SAVED_MODELS_KEY = 'saved-models';
  readonly MAX_SAVED_MODELS = 10;

  protected readonly endpoint = '/api/report';

  private _savedModels: { modelName: string, timeStamp: number, updated: number } [] = null;

  private reportTableData: ReportData;

  modelFileName: string;

  siteEvaluationNarrativeForm: FormGroup;
  siteEvaluationRatingsForm: FormGroup;
  modelMetaDataForm: FormGroup;

  compilingReport = false;

  constructor(private http: HttpClient,
              private rest: RestService,
              private fb: FormBuilder,
              private storageService: StorageService,
              private authService: AuthService) {
    this.createForms();
  }

  getStoreRowClass(category: string) {
    switch (category) {
      case 'Company Store':
        return 'blue';
      case 'Existing Competition':
        return 'yellow';
      case 'Proposed Competition':
        return 'pink';
      default:
        return 'grey';
    }
  }

  getSavedModels() {
    if (this._savedModels) {
      return of(this._savedModels);
    } else {
      return this.storageService.getOne(this.SAVED_MODELS_KEY).pipe(map(models => {
        this._savedModels = models ? models : [];
        return this._savedModels;
      }));
    }
  }

  loadLatest() {
    return this.getSavedModels().pipe(mergeMap(models => {
      if (models.length > 0) {
        const latest = _.maxBy(models, 'updated');
        return this.loadModel(latest.modelName);
      } else {
        throw new Error('No saved models!');
      }
    }));
  }

  loadModel(modelName: string) {
    return this.storageService.getOne('model-' + modelName).pipe(tap(data => {
      if (data) {
        this.reportTableData = data.reportTableData;
        this.modelFileName = data.modelFileName;
        this.siteEvaluationNarrativeForm.reset(data.siteEvaluationNarrativeForm);
        this.siteEvaluationRatingsForm.reset(data.siteEvaluationRatingsForm);
        this.modelMetaDataForm.reset(data.modelMetaDataForm);
      } else {
        throw new Error('Model data not found! Browser cache may have been deleted.');
      }
    }));
  }

  deleteSavedModel(savedModel) {
    // Delete the model data
    return this.storageService.removeOne('model-' + savedModel.modelName).pipe(mergeMap(() => {
      // Delete the item in the registry
      const index = this._savedModels.findIndex(model => model.modelName === savedModel.modelName);
      if (index >= 0) {
        this._savedModels.splice(index, 1);
        return this.storageService.set(this.SAVED_MODELS_KEY, this._savedModels);
      }
    }));
  }

  saveModel() {
    const modelName = this.modelMetaDataForm.get('modelName').value;
    const savable = {
      reportTableData: this.reportTableData,
      modelFileName: this.modelFileName,
      siteEvaluationNarrativeForm: this.siteEvaluationNarrativeForm.value,
      siteEvaluationRatingsForm: this.siteEvaluationRatingsForm.value,
      modelMetaDataForm: this.modelMetaDataForm.value
    };
    this.saving = true;
    this.storageService.set('model-' + modelName, savable)
      .pipe(finalize(() => this.saving = false))
      .pipe(mergeMap(() => {
        const model = this._savedModels.find(m => m.modelName === modelName);
        if (model) {
          model.updated = Date.now();
        } else {
          this._savedModels.push({modelName: modelName, timeStamp: Date.now(), updated: Date.now()});
          this._savedModels.sort(((a, b) => b.timeStamp - a.timeStamp));
          if (this._savedModels.length > this.MAX_SAVED_MODELS) {
            const oldModels = this._savedModels.slice(this.MAX_SAVED_MODELS);
            oldModels.forEach(m => this.deleteSavedModel(m));
          }
          this._savedModels = this._savedModels.slice(0, this.MAX_SAVED_MODELS);
        }
        return this.storageService.set(this.SAVED_MODELS_KEY, this._savedModels);
      }))
      .subscribe();
  }

  getReportTableData() {
    return this.reportTableData;
  }

  getPdf(tableName: string, data: any) {
    return this.http.post(this.rest.getNodeReportHost() + '/pdf/' + tableName, data, {responseType: 'arraybuffer'})
      .pipe(map(result => new Uint8Array(result)));
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

    this.siteEvaluationNarrativeForm.valueChanges
      .pipe(debounce(() => timer(500)))
      .subscribe(() => this.saveModel());

    this.siteEvaluationRatingsForm.valueChanges
      .pipe(debounce(() => timer(500)))
      .subscribe(() => this.saveModel());
  }

  setReportTableData(reportData: ReportData) {
    this.reportTableData = reportData;

    // If there are current volumes, find the one for the selected store and insert the assumed power into the form
    if (this.reportTableData.currentVolumes) {
      const currentVolumeRecord = this.reportTableData.currentVolumes.find(record => {
        return record.mapKey === this.reportTableData.selectedMapKey;
      });
      if (currentVolumeRecord) {
        this.siteEvaluationNarrativeForm.get('assumedPower').setValue(currentVolumeRecord.assumedPower);
      }
    }

  }

  totalAreaIfIncluded: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const category = control.get('category').value;
    const totalArea = control.get('totalArea').value;

    return (category === 'Do Not Include' || (totalArea)) ? null : {totalAreaIfInclude: true};
  };

  getDataVerificationForm() {
    if (this.reportTableData) {
      const storeControlGroups = this.reportTableData.storeList
        .map(storeItem => {
          const storeGroup = this.fb.group(storeItem);
          storeGroup.setValidators([this.totalAreaIfIncluded]);
          storeGroup.get('totalArea').setValidators([Validators.min(0)]);
          return storeGroup;
        });
      return this.fb.group({
        stores: this.fb.array(storeControlGroups)
      });
    } else {
      return null;
    }
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
