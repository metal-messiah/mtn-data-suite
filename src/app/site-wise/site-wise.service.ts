import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RestService } from '../core/services/rest.service';

@Injectable()
export class SiteWiseService {

  private readonly endpoint = '/api/site-wise';

  constructor(private http: HttpClient,
              private rest: RestService) {
  }

  downloadActiveAndFutureStores() {
    const url = this.rest.getHost() + this.endpoint + '/active-and-future';
    const headers = new HttpHeaders({
      'Content-Type': 'text/csv',
      'Authorization': 'Bearer ' + this.rest.getAccessToken()
    });
    return this.http.get(url, {headers: headers, responseType: 'blob'});
  }

  downloadEmptySites() {
    const url = this.rest.getHost() + this.endpoint + '/empty-sites';
    const headers = new HttpHeaders({
      'Content-Type': 'text/csv',
      'Authorization': 'Bearer ' + this.rest.getAccessToken()
    });
    return this.http.get(url, {headers: headers, responseType: 'blob'});
  }

  triggerSftpTransfer() {
    const url = this.rest.getHost() + this.endpoint;
    return this.http.get(url, {headers: this.rest.getHeaders(), responseType: 'text'});
  }

}
