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
  dummyDB = [
    {
      address: '123 Fake Street',
      city: 'Layton',
      state: 'UT',
      zip: 84000,
      stores: [
        {
          OBJECTID: 15,
          store_name: 'Harmons',
          store_number: 10,
          status: 'Open',
          status_date: '3/2018'
        },
        {
          OBJECTID: 20,
          store_name: 'Smith\'s',
          store_number: 9874,
          status: 'Closed',
          status_date: '11/2017'
        }
      ]
    },
    {
      address: '4564 Canyon Avenue',
      city: 'Layton',
      state: 'UT',
      zip: 84000,
      stores: [
        {
          OBJECTID: 12436,
          store_name: 'Albertsons',
          store_number: 56,
          status: 'Open',
          status_date: '3/2018'
        }
      ]
    }
  ]

  constructor(private http: HttpClient,
              private rest: RestService) {
  }

  getSourcesNotValidated(): Observable<Pageable<SimplifiedStoreSource>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('validated', 'false');
    params = params.set('size', '500');
    return this.http.get<Pageable<StoreSource>>(url, {headers: this.rest.getHeaders(), params: params});
  }

  getDBTable() {
    return this.dummyDB;
  }
}
