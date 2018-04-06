import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

import { RestService } from './rest.service';
import { EntityService } from '../../interfaces/entity-service';
import { Pageable } from '../../models/pageable';
import { Site } from '../../models/site';
import { Coordinates} from '../../models/coordinates';

@Injectable()
export class SiteService implements EntityService<Site> {

  private endpoint = '/api/site';

  constructor(private http: HttpClient, private rest: RestService) {
  }

  getById(id) {
    const url = this.rest.getHost() + this.endpoint + `/${id}`;
    return this.http.get<Site>(url, {headers: this.rest.getHeaders()});
  }

  getAllInBounds(bounds) {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('size', '300');
    _.forEach(bounds, function(value, key) {
      params = params.set(key, value);
    });
    return this.http.get<Pageable<Site>>(url, {headers: this.rest.getHeaders(), params: params});
  }

  save(site: Site): Observable<Site> {
    let url = this.rest.getHost() + this.endpoint;
    if (site.id === undefined || site.id === null) {
      return this.http.post<Site>(url, site, {headers: this.rest.getHeaders()});
    }
    url += `/${site.id}`;
    return this.http.put<Site>(url, site, {headers: this.rest.getHeaders()});
  }

  updateCoordinates(siteId: number | string, coordinates: Coordinates): Observable<Site> {
    // Retrieve full site object needed to PUT changes
    return this.getById(siteId).flatMap(site => {
      // Make the changes
      site.location.coordinates = [coordinates['lng'], coordinates['lat']];
      // Submit Changes to web service
      return this.save(site);
    });
  }

  public del(site: Site): Observable<Site> {
    const url = this.rest.getHost() + this.endpoint + `/${site.id}`;
    return this.http.delete<Site>(url, {headers: this.rest.getHeaders()});
  }

  public getOneById(id: number): Observable<Site> {
    const url = this.rest.getHost() + this.endpoint + `/${id}`;
    return this.http.get<Site>(url, {headers: this.rest.getHeaders()});
  }

  public getAll(): Observable<Pageable<Site>> {
    const url = this.rest.getHost() + this.endpoint;
    return this.http.get<Pageable<Site>>(url, {headers: this.rest.getHeaders()});
  }

}
