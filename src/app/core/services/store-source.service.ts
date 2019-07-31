import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pageable } from '../../models/pageable';
import { StoreSource } from '../../models/full/store-source';
import { Observable } from 'rxjs';
import { CrudService } from '../../interfaces/crud-service';
import { SimplifiedStoreSource } from '../../models/simplified/simplified-store-source';
import { ParamMap } from '@angular/router';

@Injectable()
export class StoreSourceService extends CrudService<StoreSource> {
  protected endpoint = '/api/store-source';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  getStoreSources(validated: boolean, page?: string, size?: string, queryParams?: ParamMap): Observable<Pageable<SimplifiedStoreSource>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    params = params.set('size', size || '250');
    params = params.set('page', page || '0');
    if (validated !== null) {
      params = params.set('validated', String(validated));
    }
    queryParams.keys.forEach(key => params = params.set(key, queryParams.get(key)));
    return this.http.get<Pageable<SimplifiedStoreSource>>(url, {headers: this.rest.getHeaders(), params: params});
  }

  validate(storeSourceId: number) {
    const url = this.rest.getHost() + this.endpoint + '/' + storeSourceId + '/validate';
    return this.http.put<StoreSource>(url, null, {headers: this.rest.getHeaders()});
  }

  invalidate(storeSourceId: number) {
    const url = this.rest.getHost() + this.endpoint + '/' + storeSourceId + '/invalidate';
    return this.http.put<StoreSource>(url, null, {headers: this.rest.getHeaders()});
  }

  setStore(storeSourceId: number, storeId: number, validate: boolean) {
    const url = this.rest.getHost() + this.endpoint + '/' + storeSourceId + '/store/' + storeId;
    const params = new HttpParams().set('validate', String(validate));
    return this.http.put<StoreSource>(url, null, {headers: this.rest.getHeaders(), params: params});
  }

  removeStore(storeSourceId: number) {
    const url = this.rest.getHost() + this.endpoint + '/' + storeSourceId + '/store';
    return this.http.delete<StoreSource>(url, {headers: this.rest.getHeaders()});
  }

  setBannerSource(storeSourceId: number, bannerSourceId: number) {
    const url = this.rest.getHost() + this.endpoint + '/' + storeSourceId + '/banner-source/' + bannerSourceId;
    return this.http.put<StoreSource>(url, null, {headers: this.rest.getHeaders()});
  }

  removeBannerSource(storeSourceId: number) {
    const url = this.rest.getHost() + this.endpoint + '/' + storeSourceId + '/banner-source';
    return this.http.delete<StoreSource>(url, {headers: this.rest.getHeaders()});
  }

  protected createEntityFromObj(entityObj): StoreSource {
    return new StoreSource(entityObj);
  }
}
