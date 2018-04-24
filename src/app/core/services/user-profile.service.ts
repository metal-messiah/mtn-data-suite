import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { UserProfile } from '../../models/user-profile';
import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Pageable } from '../../models/pageable';
import { Observable } from 'rxjs/Observable';
import { SimplifiedUserProfile } from '../../models/simplified-user-profile';

@Injectable()
export class UserProfileService extends CrudService<UserProfile> {

  protected endpoint = '/api/user';

  constructor(protected http: HttpClient, protected  rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): UserProfile {
    return new UserProfile(entityObj);
  }

  getAllUserProfiles(): Observable<Pageable<SimplifiedUserProfile>> {
    const url = this.rest.getHost() + this.endpoint;
    return this.http.get<Pageable<SimplifiedUserProfile>>(url, {headers: this.rest.getHeaders()})
      .map(page => {
        page.content = page.content.map(entityObj => new SimplifiedUserProfile(entityObj));
        return page;
      });
  }

}
