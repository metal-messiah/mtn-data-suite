import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {UserProfile} from '../../models/user-profile';
import {RestService} from './rest.service';
import {CrudService} from '../../interfaces/crud-service';

@Injectable()
export class UserProfileService extends CrudService<UserProfile> {

  private endpoint = '/api/user';

  constructor(protected http: HttpClient, protected  rest: RestService) {
    super(http, rest);
  }

  protected getEndpoint(): string {
    return this.endpoint;
  }
}
