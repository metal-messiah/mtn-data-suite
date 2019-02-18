import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Site } from '../../models/full/site';
import { SimplifiedSite } from '../../models/simplified/simplified-site';
import { Coordinates } from '../../models/coordinates';
import { Store } from '../../models/full/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';

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

  getSitePointsInBounds(bounds: any): Observable<Coordinates[]> {
    const url = this.rest.getHost() + this.endpoint + '/points';
    let params = new HttpParams();
    _.forEach(bounds, function (value, key) {
      params = params.set(key, value);
    });
    return this.http.get<Coordinates[]>(url, {headers: this.rest.getHeaders(), params: params})
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

  assignSiteToUser(site: Site, userId: number) {
    const url = this.rest.getHost() + this.endpoint + '/' + site.id + '/assign-to-user';
    let params = new HttpParams();
    if (userId != null) {
      params = params.set('user-id', String(userId));
    }
    return this.http.post<Site>(url, null, {headers: this.rest.getHeaders(), params: params})
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

  mergeSites(mergedSite: Site, siteIds: number[]) {
    const url = this.rest.getHost() + this.endpoint + '/merge';
    const body = {
      mergedSite: mergedSite,
      siteIds: siteIds
    };
    return this.http.post<SimplifiedSite>(url, body, {headers: this.rest.getHeaders()})
  }

}
