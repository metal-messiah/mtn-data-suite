import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RestService } from '../../core/services/rest.service';


@Injectable()
export class PlannedGroceryService {

  private endpoint = '/api/planned-grocery';

  constructor(private http: HttpClient,
              private rest: RestService) {
  }

  getFeatureByObjectId(objectId: string): Observable<any> {
    const url = this.rest.getHost() + this.endpoint + '/' + objectId;
    return this.http.get<any>(url, { headers: this.rest.getHeaders() });
  }

  pingRefresh() {
    const url = this.rest.getHost() + this.endpoint;
    return this.http.post(url, null, { headers: this.rest.getHeaders() })
  }

}
