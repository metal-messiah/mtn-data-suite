import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Pageable } from '../../models/pageable';
import { Site } from '../../models/site';

@Injectable()
export class SiteService extends CrudService<Site> {

  private endpoint = '/api/site';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected getEndpoint(): string {
    return this.endpoint;
  };

  getActiveInBounds(bounds) {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('size', '300');
    params = params.set('store_type', 'ACTIVE');
    _.forEach(bounds, function(value, key) {
      params = params.set(key, value);
    });
    return this.http.get<Pageable<Site>>(url, {headers: this.rest.getHeaders(), params: params});
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
