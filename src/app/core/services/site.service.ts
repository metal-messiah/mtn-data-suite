import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestService } from './rest.service';
import { Pageable } from '../../models/pageable';
import { Site } from '../../models/site';
import * as _ from 'lodash';

@Injectable()
export class SiteService {

  private endpoint = '/api/site';

  constructor(private http: HttpClient, private rest: RestService) {
  }

  getById(id) {
    const url = this.rest.getHost() + this.endpoint + `/${id}`;
    return this.http.get<Site>(url, {headers: this.rest.getHeaders()});
  }

  getAllInBounds(bounds) {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('size', '300');
    _.forEach(bounds, function(value, key) {
      params = params.set(key, value);
    });
    return this.http.get<Pageable<Site>>(url, {headers: this.rest.getHeaders(), params: params});
  }

}
