import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestService } from './services/rest.service';
import { Observable, Subject } from 'rxjs';
import * as _ from 'lodash';
import { Pageable } from '../models/pageable';
import { SiteMarker } from '../models/site-marker';
import { map } from 'rxjs/operators';
import { DateUtil } from '../utils/date-util';

@Injectable({
  providedIn: 'root'
})
export class SiteMarkerService {

  private readonly endpoint = '/api/site-marker';
  private readonly defaultPageSize = 100;

  constructor(private http: HttpClient,
              private rest: RestService) {
  }

  getSiteMarkersForView(newBounds: {north: number, south: number, east: number, west: number},
                        prevBounds?: {north: number, south: number, east: number, west: number},
                        updatedAt?: Date): Observable<SiteMarker[]> {
    if (prevBounds && updatedAt) {
      const url = this.rest.getHost() + this.endpoint;
      let params = new HttpParams();
      _.forEach(newBounds, (value, key) => params = params.set(key, String(value)));
      _.forEach(prevBounds, (value, key) => params = params.set('prev-' + key, String(value)));
      params = params.set('updated-at', DateUtil.formatDateForUrlParam(updatedAt));
      return this.http.get<SiteMarker[]>(url, {headers: this.rest.getHeaders(), params: params})
        .pipe(map(siteMarkers => siteMarkers.map(sm => new SiteMarker(sm))));
    } else {
      return this.getSiteMarkersInBounds(newBounds);
    }
  }

  private getSiteMarkersInBounds(bounds: {north: number, south: number, east: number, west: number}) {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    _.forEach(bounds, (value, key) => params = params.set(key, String(value)));
    return this.http.get<SiteMarker[]>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(map(siteMarkers => siteMarkers.map(sm => new SiteMarker(sm))));
  }

  getSiteMarkersInRadius(latitude: number, longitude: number, radiusMeters: number) {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    params = params.set('latitude', String(latitude));
    params = params.set('longitude', String(longitude));
    params = params.set('radiusMeters', String(radiusMeters));
    return this.runPages(url, params, this.defaultPageSize, 0, new Subject<SiteMarker[]>());
  }

  getSiteMarkersInGeoJson(geoJson: string) {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    params = params.set('geojson', String(geoJson));
    return this.runPages(url, params, this.defaultPageSize, 0, new Subject<SiteMarker[]>());
  }

  /**
   * Recursively gets pages of SiteMarkers, finally returning the complete list.
   * This is done to avoid bogging down the server.
   * @param url
   * @param params
   * @param pageSize
   * @param pageNumber
   * @param obs$
   */
  private runPages(url: string, params: HttpParams, pageSize: number, pageNumber: number,
                   obs$: Subject<SiteMarker[]>) {
    params = params.set('size', String(pageSize));
    params = params.set('page', String(pageNumber));
    this.http.get<Pageable<SiteMarker>>(url, {headers: this.rest.getHeaders(), params: params})
      .subscribe((page: Pageable<SiteMarker>) => {
        // Add markers for page to markers in Bounds
        obs$.next(page.content.map(sm => new SiteMarker(sm)));
        // If last page, or another request has started, finish and notify caller.
        if (page.last) {
          obs$.complete();
        } else {
          // Otherwise, continue retrieving pages.
          this.runPages(url, params, pageSize, pageNumber + 1, obs$);
        }
      });
    return obs$;
  }
}
