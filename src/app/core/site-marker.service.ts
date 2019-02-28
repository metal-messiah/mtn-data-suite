import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestService } from './services/rest.service';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { Pageable } from '../models/pageable';
import { SiteMarker } from '../models/site-marker';

@Injectable({
  providedIn: 'root'
})
export class SiteMarkerService {

  private readonly endpoint = '/api/site-marker';
  private readonly defaultPageSize = 100;

  constructor(private http: HttpClient,
              private rest: RestService) {
  }

  getSiteMarkersInBounds(bounds: any, handbrake: { interrupt: boolean }, sortBy?: string) {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    if (sortBy) {
      params = params.set('sort', 'longitude');
    }
    _.forEach(bounds, (value, key) => params = params.set(key, value));
    return this.runPages(url, params, this.defaultPageSize, 0, new Subject<SiteMarker[]>(), handbrake);
  }

  getSiteMarkersInRadius(latitude: number, longitude: number, radiusMeters: number, handbrake: { interrupt: boolean }) {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    params = params.set('latitude', String(latitude));
    params = params.set('longitude', String(longitude));
    params = params.set('radiusMeters', String(radiusMeters));
    return this.runPages(url, params, this.defaultPageSize, 0, new Subject<SiteMarker[]>(), handbrake);
  }

  getSiteMarkersInGeoJson(geoJson: string, handbrake: { interrupt: boolean }) {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    params = params.set('geojson', String(geoJson));
    return this.runPages(url, params, this.defaultPageSize, 0, new Subject<SiteMarker[]>(), handbrake);
  }

  /**
   * Recursively gets pages of SiteMarkers, finally returning the complete list.
   * This is done to avoid bogging down the server.
   * @param url
   * @param params
   * @param pageSize
   * @param pageNumber
   * @param obs$
   * @param handbrake
   */
  private runPages(url: string, params: HttpParams, pageSize: number, pageNumber: number,
                   obs$: Subject<SiteMarker[]>, handbrake: { interrupt: boolean }) {
    params = params.set('size', String(pageSize));
    params = params.set('page', String(pageNumber));
    this.http.get<Pageable<SiteMarker>>(url, {headers: this.rest.getHeaders(), params: params})
      .subscribe((page: Pageable<SiteMarker>) => {
        // Add markers for page to markers in Bounds
        obs$.next(page.content.map(sm => new SiteMarker(sm)));
        // If last page, or another request has started, finish and notify caller.
        if (page.last || handbrake.interrupt) {
          obs$.complete();
        } else {
          // Otherwise, continue retrieving pages.
          this.runPages(url, params, pageSize, pageNumber + 1, obs$, handbrake);
        }
      });
    return obs$;
  }
}
