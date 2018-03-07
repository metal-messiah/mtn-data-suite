import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { List } from 'lodash';
import { Duplicate } from '../../models/duplicate';
import { Site } from '../../models/site';
import { HttpClient } from '@angular/common/http';
import { RestService } from './rest.service';

@Injectable()
export class DuplicateService {

  private endpoint = '/api/duplicate';

  private testData: Duplicate<Site>[] = [
    new Duplicate<Site>([{id:1, storeName: 'Kroger1', city:'SLC', state: 'UT', latitude:123, longitude: 456}, {id:2, storeName: 'Kroger2', city:'SLC', state: 'UT', latitude:123, longitude: 456}]),
    new Duplicate<Site>([{id:3, storeName: 'Kroger', city:'SLC', state: 'UT', latitude:123, longitude: 456}, {id:4, storeName: 'Kroger', city:'SLC', state: 'UT', latitude:123, longitude: 456}]),
    new Duplicate<Site>([{id:5, storeName: 'Kroger', city:'SLC', state: 'UT', latitude:123, longitude: 456}, {id:6, storeName: 'Kroger', city:'SLC', state: 'UT', latitude:123, longitude: 456}])
    
  ];

  constructor(private http: HttpClient, private rest: RestService) {
  }

  public getAllDuplicateSites(): Observable<Duplicate<Site>[]> {
    // const url = this.rest.getHost() + this.endpoint;
    // return this.http.get<Duplicate<Site>[]>(url, {headers: this.rest.getHeaders()});
    return Observable.of(this.testData);
  }
}
