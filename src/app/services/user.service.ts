import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {tap} from 'rxjs/operators';

import {UserProfile} from '../models/user-profile';
import {Pageable} from '../models/pageable';
import {RestService} from './rest.service';

@Injectable()
export class UserService {

  private endpoint = '/api/user';

  constructor(private http: HttpClient, private rest: RestService) {
  }

  public getUserProfile(id: number): Observable<UserProfile> {
    const url = this.rest.getHost() + this.endpoint + `/${id}`;
    return this.http.get<UserProfile>(url, {headers: this.rest.getHeaders()})
      .pipe(
        tap( u => console.log(`Successfully retrieved user with id: ${u['id']}`))
      );
  }

  public getUserProfiles(): Observable<Pageable<UserProfile>> {
    const url = this.rest.getHost() + this.endpoint;
    const params = new HttpParams().set('simple', 'false');
    return this.http.get<Pageable<UserProfile>>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(
        tap( p => console.log('Fetched ' + p['content'].length + ' users.'))
      );
  }

  public saveUser(user: UserProfile) {
    const url = this.rest.getHost() + this.endpoint;
    if (user.id === null) {
      return this.http.post<UserProfile>(url, user, {headers: this.rest.getHeaders()})
        .pipe(
          tap(u => console.log(`Successfully saved new user with id: ${u['id']}`))
        );
    } else {
      return this.http.put<UserProfile>(url + `/${user.id}`, user, {headers: this.rest.getHeaders()})
        .pipe(
          tap(u => console.log(`Successfully updated user with id: ${u['id']}`))
        );
    }
  }
}
