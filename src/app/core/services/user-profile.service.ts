import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { UserProfile } from '../../models/full/user-profile';
import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Pageable } from '../../models/pageable';
import { Observable } from 'rxjs/index';
import { map } from 'rxjs/internal/operators';

@Injectable()
export class UserProfileService extends CrudService<UserProfile> {

  protected endpoint = '/api/user';

  constructor(protected http: HttpClient, protected  rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): UserProfile {
    return new UserProfile(entityObj);
  }

  getUserProfiles(pageNumber?: number): Observable<Pageable<UserProfile>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    if (pageNumber != null) {
      params = params.set('page', pageNumber.toLocaleString());
    }
    params = params.set('sort', 'firstName,lastName');
    return this.http.get<Pageable<UserProfile>>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(map(page => {
        page.content = page.content.map(entityObj => new UserProfile(entityObj));
        return page;
      }));
  }

}
