import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Duplicate } from '../../models/duplicate';
import { Site } from '../../models/site';
import { HttpClient } from '@angular/common/http';
import { RestService } from './rest.service';

@Injectable()
export class DuplicateService {

  private endpoint = '/api/duplicate';

  constructor(private http: HttpClient,
              private rest: RestService) {
  }

  public getAll(): Observable<Duplicate<Site>[]> {
    const url = this.rest.getHost() + this.endpoint;
    return this.http.get<Duplicate<Site>[]>(url, {headers: this.rest.getHeaders()});
  }
}
