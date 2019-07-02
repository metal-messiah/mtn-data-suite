// UTILITIES
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// SERVICES
import { RestService } from '../../core/services/rest.service';

// MODELS

@Injectable()
export class ChainXyService {
  private endpoint = '/api/chainxy';

  selectedBannerSource = null;

  constructor(private http: HttpClient, private rest: RestService) {
  }

  setSelectedBannerSource(chain) {
    this.selectedBannerSource = chain;
  }

  getSelectedBannerSource() {
    return this.selectedBannerSource;
  }

  getFeatureByObjectId(objectId: number): Observable<any> {
    const url = this.rest.getHost() + this.endpoint + '/store-source-record/' + objectId;
    return this.http.get<any>(url, {headers: this.rest.getHeaders()});
  }

  pingRefresh() {
    const url = this.rest.getHost() + this.endpoint;
    return this.http.post(url, null, {headers: this.rest.getHeaders()});
  }
}
