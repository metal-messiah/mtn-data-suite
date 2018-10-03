import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class ExtractionService {

  private endpoint = '/api/extraction';

  constructor(protected http: HttpClient, private rest: RestService) {
  }

  extractByProjectId(projectId: number, fieldSetId: number) {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('project-id', String(projectId));
    params = params.set('field-set-id', String(fieldSetId));
    const headers = new HttpHeaders({
      'Content-Type': 'text/csv',
      'Authorization': 'Bearer ' + localStorage.getItem('access_token')
    });
    return this.http.get(url, {headers: headers, params: params, responseType: 'blob'})
  }

  extractLatestDataForStores(storeIds: number[], fieldSetId: number) {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('store-ids', storeIds.toString());
    params = params.set('field-set-id', String(fieldSetId));
    const headers = new HttpHeaders({
      'Content-Type': 'text/csv',
      'Authorization': 'Bearer ' + localStorage.getItem('access_token')
    });
    return this.http.get(url, {headers: headers, params: params, responseType: 'blob'})

  }
}
