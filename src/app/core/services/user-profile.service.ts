import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { UserProfile } from '../../models/full/user-profile';
import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Pageable } from '../../models/pageable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import { SimplifiedPermission } from '../../models/simplified/simplified-permission';

@Injectable()
export class UserProfileService extends CrudService<UserProfile> {

  protected endpoint = '/api/user';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  getUserProfiles(pageNumber: number = 0, size: number = 50): Observable<Pageable<UserProfile>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('page', String(pageNumber));
    params = params.set('size', String(size));
    params = params.set('sort', 'firstName,lastName');
    return this.http.get<Pageable<UserProfile>>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(map(page => {
        page.content = page.content.map(entityObj => new UserProfile(entityObj));
        return page;
      }));
  }

  setUserGroup(userProfileId: number, groupId: number) {
    let url = this.rest.getHost() + this.endpoint + '/' + userProfileId + '/group';
    let request: Observable<any>;
    if (groupId) {
      url += '/' + groupId;
      request = this.http.put(url, null, {headers: this.rest.getHeaders()});
    } else {
      request = this.http.delete(url, {headers: this.rest.getHeaders()});
    }
    return request.pipe(map(up => new UserProfile(up)));
  }

  setUserRole(userProfileId: number, roleId: number) {
    let url = this.rest.getHost() + this.endpoint + '/' + userProfileId + '/role';
    let request: Observable<any>;
    if (roleId) {
      url += '/' + roleId;
      request = this.http.put(url, null, {headers: this.rest.getHeaders()});
    } else {
      request = this.http.delete(url, {headers: this.rest.getHeaders()});
    }
    return request.pipe(map(up => new UserProfile(up)));
  }

  getUserPermissions(userId: number): Observable<SimplifiedPermission[]> {
    const url = this.rest.getHost() + this.endpoint + '/' + userId + '/permissions';
    return this.http.get<SimplifiedPermission[]>(url, {headers: this.rest.getHeaders()})
      .pipe(map(permissions => permissions.map(p => new SimplifiedPermission(p))));
  }

  updateUserPermissions(userId: number, permissionIds: number[]) {
    const url = this.rest.getHost() + this.endpoint + '/' + userId + '/permissions';
    return this.http.put<UserProfile>(url, permissionIds, {headers: this.rest.getHeaders()})
      .pipe(map(userProfile => new UserProfile(userProfile)));
  }


  protected createEntityFromObj(entityObj): UserProfile {
    return new UserProfile(entityObj);
  }

}
