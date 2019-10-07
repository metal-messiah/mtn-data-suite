import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Site } from '../../models/full/site';
import { SimplifiedSite } from '../../models/simplified/simplified-site';
import { LatLng } from '../../models/latLng';
import { Store } from '../../models/full/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import { SiteUtil } from '../../utils/SiteUtil';

@Injectable()
export class SiteService extends CrudService<Site> {

  protected endpoint = '/api/site';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): Site {
    return new Site(entityObj);
  }

  getAllByIds(ids: number[]) {
    const url = this.rest.getHost() + this.endpoint;
    const params = new HttpParams().set('ids', ids.toString());
    return this.http.get<Site[]>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(map(sites => sites.map(site => new SimplifiedSite(site))));
  }


  addNewStore(siteId: number, store: Store) {
    const url = this.rest.getHost() + this.endpoint + '/' + siteId + '/store';
    return this.http.post<Store>(url, store, {headers: this.rest.getHeaders()})
      .pipe(map((savedStore) => new Store(savedStore)));
  }

  getSitePointsInBounds(bounds: any): Observable<LatLng[]> {
    const url = this.rest.getHost() + this.endpoint + '/points';
    let params = new HttpParams();
    _.forEach(bounds, function (value, key) {
      params = params.set(key, value);
    });
    return this.http.get<LatLng[]>(url, {headers: this.rest.getHeaders(), params: params});
  }

  assignSitesToUser(siteIds: number[], userId: number) {
    const url = this.rest.getHost() + this.endpoint + '/assign-to-user';
    let params = new HttpParams();
    if (userId != null) {
      params = params.set('user-id', String(userId));
    }
    return this.http.post<SimplifiedSite[]>(url, siteIds, {headers: this.rest.getHeaders(), params: params})
      .pipe(map(sites => sites.map(site => new SimplifiedSite(site))));
  }

  assignSiteToUser(siteId: number, userId: number) {
    const url = this.rest.getHost() + this.endpoint + '/' + siteId + '/assign-to-user';
    let params = new HttpParams();
    if (userId != null) {
      params = params.set('user-id', String(userId));
    }
    return this.http.post<Site>(url, null, {headers: this.rest.getHeaders(), params: params})
      .pipe(map(s => new Site(s)));
  }

  getFormattedIntersection(site): string {
    return SiteUtil.getFormattedIntersection(site);
  }

  getFormattedPrincipality(site): string {
    return SiteUtil.getFormattedPrincipality(site);
  }

  getCoordinates(site: Site | SimplifiedSite): LatLng {
    return {lat: site.latitude, lng: site.longitude};
  }

  mergeSites(mergedSite: Site, siteIds: number[]) {
    const url = this.rest.getHost() + this.endpoint + '/merge';
    const body = {
      mergedSite: mergedSite,
      siteIds: siteIds
    };
    return this.http.post<SimplifiedSite>(url, body, {headers: this.rest.getHeaders()});
  }

}
