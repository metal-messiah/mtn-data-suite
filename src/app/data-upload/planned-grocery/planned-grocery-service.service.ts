import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/index';
import { HttpClient } from '@angular/common/http';
import { RestService } from '../../core/services/rest.service';


@Injectable()
export class PlannedGroceryService {

  private endpoint = '/api/planned-grocery';

  constructor(private http: HttpClient,
              private rest: RestService) {
  }

  getFeatureByObjectId(objectId: string): Observable<{features}> {
    const url = this.rest.getHost() + this.endpoint + '/' + objectId;

    return this.http.get<{features}>(url, {headers: this.rest.getHeaders()});
  }

}
