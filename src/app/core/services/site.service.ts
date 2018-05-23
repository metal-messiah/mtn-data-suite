import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Site } from '../../models/site';

@Injectable()
export class SiteService extends CrudService<Site> {

  protected endpoint = '/api/site';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): Site {
    return new Site(entityObj);
  }

  assignToUser(siteIds: number[], userId: number) {
    const url = this.rest.getHost() + this.endpoint + '/assign-to-user';
    let params = new HttpParams();
    if (userId != null) {
      params = params.set('user-id', String(userId));
    }
    return this.http.post<Site[]>(url, siteIds, {headers: this.rest.getHeaders(), params: params})
      .map(sites => {
        return sites.map(site => this.createEntityFromObj(site));
      });
  }

}
