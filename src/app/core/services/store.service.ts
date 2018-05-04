import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Store } from '../../models/store';
import { Pageable } from '../../models/pageable';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class StoreService extends CrudService<Store> {

  protected endpoint = '/api/store';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  getStoresOfTypeInBounds(bounds: any): Observable<Pageable<Store>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('size', '300');
    params = params.set('store_type', 'ACTIVE');
    _.forEach(bounds, function(value, key) {
      params = params.set(key, value);
    });
    return this.http.get<Pageable<Store>>(url, {headers: this.rest.getHeaders(), params: params})
      .map((page) => {
        page.content = page.content.map(store => new Store(store));
        return page;
      });
  }

  protected createEntityFromObj(entityObj): Store {
    return new Store(entityObj);
  }
}
