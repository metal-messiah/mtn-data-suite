import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {tap} from 'rxjs/operators';

import {UserProfile} from '../../models/user-profile';
import {Pageable} from '../../models/pageable';
import {RestService} from './rest.service';
import {EntityService} from '../../interfaces/entity-service';

@Injectable()
export class UserProfileService implements EntityService<UserProfile> {

  private endpoint = '/api/user';

  constructor(private http: HttpClient, private rest: RestService) {
  }

  public getOneById(id: number): Observable<UserProfile> {
    const url = this.rest.getHost() + this.endpoint + `/${id}`;
    return this.http.get<UserProfile>(url, {headers: this.rest.getHeaders()})
      .pipe(
        tap( u => console.log(`Successfully retrieved user with id: ${u['id']}`))
      );
  }

  public getAll(): Observable<Pageable<UserProfile>> {
    const url = this.rest.getHost() + this.endpoint;
    const params = new HttpParams().set('simple', 'false');
    return this.http.get<Pageable<UserProfile>>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(
        tap( p => console.log('Fetched ' + p['content'].length + ' user profiles.'))
      );
  }

  public save(user: UserProfile) {
    let url = this.rest.getHost() + this.endpoint;
    if (user.id === undefined || user.id === null) {
      return this.http.post<UserProfile>(url, user, {headers: this.rest.getHeaders()});
    }
    url += `/${user.id}`;
    return this.http.put<UserProfile>(url, user, {headers: this.rest.getHeaders()});
  }

  public del(user: UserProfile): Observable<UserProfile> {
    const url = this.rest.getHost() + this.endpoint + `/${user.id}`;
    return this.http.delete<UserProfile>(url, {headers: this.rest.getHeaders()});
  }
}
