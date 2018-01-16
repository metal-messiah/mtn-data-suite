import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {RestService} from '../../core/services/rest.service';
import {Observable} from 'rxjs/Observable';
import {Pageable} from '../../models/pageable';
import {Permission} from '../../models/permission';
import {tap} from 'rxjs/operators';

@Injectable()
export class PermissionService {

  private endpoint = '/api/permission';

  constructor(
    private http: HttpClient,
    private rest: RestService
  ) { }

  public getPermissions(): Observable<Pageable<Permission>> {
    const url = this.rest.getHost() + this.endpoint;
    const params = new HttpParams().set('size', '100');
    return this.http.get<Pageable<Permission>>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(
        tap( p => console.log(`Fetched ${p['content'].length} permissions.`))
      );
  }

}
