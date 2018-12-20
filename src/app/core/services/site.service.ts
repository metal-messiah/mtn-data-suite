import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Site } from '../../models/full/site';
import { SimplifiedSite } from '../../models/simplified/simplified-site';
import { Coordinates } from '../../models/coordinates';
import { Store } from '../../models/full/store';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/internal/operators';

@Injectable()
export class SiteService extends CrudService<Site> {

  protected endpoint = '/api/site';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): Site {
    return new Site(entityObj);
  }

  addNewStore(siteId: number, store: Store) {
    const url = this.rest.getHost() + this.endpoint + '/' + siteId + '/store';
    return this.http.post<Store>(url, store, {headers: this.rest.getHeaders()})
      .pipe(map((savedStore) => new Store(savedStore)));
  }

  updateIsDuplicate(siteId: number, isDuplicate: boolean) {
    const url = this.rest.getHost() + this.endpoint + '/' + siteId;
    const params = new HttpParams().set('is-duplicate', String(isDuplicate));
    return this.http.put<SimplifiedSite>(url, null, {headers: this.rest.getHeaders(), params})
      .pipe(map((simpleSite) => new SimplifiedSite(simpleSite)));
  }

  getSitesWithoutStoresInBounds(bounds: any): Observable<SimplifiedSite[]> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('size', '300');
    params = params.set('no_stores', 'true');
    _.forEach(bounds, function (value, key) {
      params = params.set(key, value);
    });
    return this.http.get<SimplifiedSite[]>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(map(list => list.map(site => new SimplifiedSite(site))));
  }

  getSitePointsInBounds(bounds: any): Observable<Coordinates[]> {
    const url = this.rest.getHost() + this.endpoint + '/points';
    let params = new HttpParams();
    _.forEach(bounds, function (value, key) {
      params = params.set(key, value);
    });
    return this.http.get<Coordinates[]>(url, {headers: this.rest.getHeaders(), params: params})
  }

  assignToUser(siteIds: number[], userId: number) {
    const url = this.rest.getHost() + this.endpoint + '/assign-to-user';
    let params = new HttpParams();
    if (userId != null) {
      params = params.set('user-id', String(userId));
    }
    return this.http.post<SimplifiedSite[]>(url, siteIds, {headers: this.rest.getHeaders(), params: params})
      .pipe(map(sites => sites.map(site => new SimplifiedSite(site))));
  }

  getFormattedIntersection(site: Site | SimplifiedSite): string {
    let intersection = '';
    if (site.quad !== null) {
      intersection += site.quad;
      if (site.intersectionStreetPrimary !== null || site.intersectionStreetSecondary !== null) {
        intersection += ' of ';
      }
    }
    if (site.intersectionStreetPrimary !== null) {
      intersection += site.intersectionStreetPrimary;
      if (site.intersectionStreetSecondary !== null) {
        intersection += ' & ';
      }
    }
    if (site.intersectionStreetSecondary !== null) {
      intersection += site.intersectionStreetSecondary;
    }
    return intersection;
  }

  getFormattedPrincipality(site: Site | SimplifiedSite): string {
    let principality = '';
    if (site.city !== null) {
      principality += site.city;
      if (site.state !== null) {
        principality += ', ';
      }
    }
    if (site.state !== null) {
      principality += site.state;
    }
    if (site.postalCode !== null) {
      if (principality.length > 0) {
        principality += ' ';
      }
      principality += site.postalCode;
    }
    return principality;
  }

  getCoordinates(site: Site | SimplifiedSite): Coordinates {
    return {lat: site.latitude, lng: site.longitude};
  }

  mergeSite(site1, site2, mergedSite) {
    const url = this.rest.getHost() + this.endpoint + '/merge';
    let params = new HttpParams().set('site-a-id', site1.id);
    params = params.set('site-b-id', site2.id);
    return this.http.post<SimplifiedSite>(url, mergedSite, {headers: this.rest.getHeaders(), params: params})
  }
}
