import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Store } from '../../models/store';
import { Pageable } from '../../models/pageable';
import { Observable } from 'rxjs/Observable';
import { SimplifiedStoreStatus } from '../../models/simplified-store-status';

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

  setCurrentStatus(store: Store, status: SimplifiedStoreStatus) {
    const url = this.rest.getHost() + this.endpoint + `/${store.id}/current-store-status/${status.id}`;

    return this.http.put<Store>(url, null, {headers: this.rest.getHeaders()})
      .map(updatedStore => {
        return new Store(updatedStore);
      });
  }

  createNewStatus(store: Store, status: SimplifiedStoreStatus) {
    const url = this.rest.getHost() + this.endpoint + `/${store.id}/store-statuses`;

    return this.http.post<Store>(url, status, {headers: this.rest.getHeaders()})
      .map(updatedStore => {
        return new Store(updatedStore);
      });
  }

  deleteStatus(store: Store, status: SimplifiedStoreStatus) {
    const url = this.rest.getHost() + this.endpoint + `/${store.id}/store-statuses/${status.id}`;

    return this.http.delete<Store>(url, {headers: this.rest.getHeaders()})
      .map(updatedStore => {
        return new Store(updatedStore);
      });
  }

  protected createEntityFromObj(entityObj): Store {
    return new Store(entityObj);
  }
}
