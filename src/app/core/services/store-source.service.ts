import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pageable } from '../../models/pageable';
import { SimplifiedSite } from '../../models/simplified/simplified-site';
import { StoreSource } from '../../models/full/store-source';
import { Observable } from 'rxjs/index';
import { SimplifiedStoreSource } from '../../models/simplified/simplified-store-source';

@Injectable()
export class StoreSourceService {

  private endpoint = '/api/store-source';

  dummyData: object[];
  dummyDB: object[];

  constructor(private http: HttpClient,
              private rest: RestService) {
  }

  getSourcesNotValidated(): Observable<Pageable<SimplifiedStoreSource>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('validated', 'false');
    params = params.set('size', '100');
    return this.http.get<Pageable<StoreSource>>(url, {headers: this.rest.getHeaders(), params: params});
  }

  getDBTable() {
    return this.dummyDB;
  }
}
