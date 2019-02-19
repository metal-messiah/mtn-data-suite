import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SourceUpdatable } from '../../models/source-updatable';
import { RestService } from './rest.service';
import { map } from 'rxjs/operators';
import { SimplifiedStore } from '../../models/simplified/simplified-store';

@Injectable()
export class SourceUpdatableService {

  private endpoint = '/api/source-updatable';

  constructor(private http: HttpClient,
              private rest: RestService) { }

  // If store already exists in Database
  getUpdatableByStoreId(storeId: number) {
    const url = this.rest.getHost() + this.endpoint + '/updatable';
    const params = new HttpParams().set('store-id', String(storeId));
    return this.http.get<SourceUpdatable>(url, { headers: this.rest.getHeaders(), params })
      .pipe(map(record => new SourceUpdatable(record)));
  }

  // If Creating a new store for an existing site
  getUpdatableBySiteId(siteId: number) {
    const url = this.rest.getHost() + this.endpoint + '/updatable';
    const params = new HttpParams().set('site-id', String(siteId));
    return this.http.get<SourceUpdatable>(url, { headers: this.rest.getHeaders(), params })
      .pipe(map(record => new SourceUpdatable(record)));
  }

  // If Creating a new site + store in an existing shopping center
  getUpdatableByShoppingCenterId(shoppingCenterId: number) {
    const url = this.rest.getHost() + this.endpoint + '/updatable';
    const params = new HttpParams().set('shopping-center-id', String(shoppingCenterId));
    return this.http.get<SourceUpdatable>(url, { headers: this.rest.getHeaders(), params })
      .pipe(map(record => new SourceUpdatable(record)));
  }

  submitUpdate(update: SourceUpdatable) {
    const url = this.rest.getHost() + this.endpoint + '/updatable';
    return this.http.post<SimplifiedStore>(url, update, { headers: this.rest.getHeaders() })
      .pipe(map(record => new SimplifiedStore(record)));
  }
}
