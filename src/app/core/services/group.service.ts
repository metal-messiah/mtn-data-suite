import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RestService} from './rest.service';
import {Observable} from 'rxjs/Observable';
import {Pageable} from '../../models/pageable';
import {tap} from 'rxjs/operators';
import {Group} from '../../models/group';

@Injectable()
export class GroupService {

  private endpoint = '/api/group';

  constructor(private http: HttpClient, private rest: RestService) {
  }

  public getGroups(): Observable<Pageable<Group>> {
    const url = this.rest.getHost() + this.endpoint;
    return this.http.get<Pageable<Group>>(url, {headers: this.rest.getHeaders()})
      .pipe(
        tap( p => console.log('Fetched ' + p['content'].length + ' groups.'))
      );
  }

}
