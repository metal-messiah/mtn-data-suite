import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Site } from '../../models/full/site';
import { SimplifiedSite } from '../../models/simplified/simplified-site';
import { Coordinates } from '../../models/coordinates';
import { Pageable } from '../../models/pageable';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SiteService extends CrudService<Site> {

  protected endpoint = '/api/site';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): Site {
    return new Site(entityObj);
  }

  getSitesWithoutStoresInBounds(bounds: any): Observable<Pageable<SimplifiedSite>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('size', '300');
    params = params.set('no_stores', 'true');
    _.forEach(bounds, function (value, key) {
      params = params.set(key, value);
    });
    return this.http.get<Pageable<SimplifiedSite>>(url, {headers: this.rest.getHeaders(), params: params})
      .map((page) => {
        page.content = page.content.map(site => new SimplifiedSite(site));
        return page;
      });
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

}
