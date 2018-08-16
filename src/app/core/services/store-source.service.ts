import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pageable } from '../../models/pageable';
import { StoreSource } from '../../models/full/store-source';
import { Observable } from 'rxjs';
import { CrudService } from '../../interfaces/crud-service';

@Injectable()
export class StoreSourceService extends CrudService<StoreSource> {

  protected endpoint = '/api/store-source';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  getSourcesNotValidated(sourceName ?: string): Observable<Pageable<StoreSource>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('validated', 'false');
    params = params.set('size', '100');
    if (sourceName) {
      params = params.set('source-name', sourceName);
    }
    return this.http.get<Pageable<StoreSource>>(url, {headers: this.rest.getHeaders(), params: params});
  }

  // update(storeSource: StoreSource, validate: boolean) {
  //   const url = this.rest.getHost() + this.endpoint;
  //   const params = new HttpParams().set('validate', String(validate));
  //   return this.http.put<StoreSource>(url, storeSource, {headers: this.rest.getHeaders(), params: params});
  // }

  protected createEntityFromObj(entityObj): StoreSource {
    return new StoreSource(entityObj);
  }

}
