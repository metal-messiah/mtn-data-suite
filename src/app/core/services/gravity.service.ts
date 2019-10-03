import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class GravityService {

  private readonly endpoint = '/api/gravity';

  constructor(private http: HttpClient,
              private rest: RestService) {
  }

  getProjectAttractionTotals(projectId: number) {
    const url = this.rest.getHost() + this.endpoint + '/attraction-totals';
    const params = new HttpParams().set('project-id', String(projectId));
    return this.http.get(url, {headers: this.rest.getHeaders(), params: params});
  }

  getProjectBlockGroupGeoJson(projectId: number) {
    const url = this.rest.getHost() + this.endpoint;
    const params = new HttpParams().set('project-id', String(projectId));
    return this.http.get(url, {headers: this.rest.getHeaders(), params: params});
  }

  getWebForBlockGroup(fips: string, projectId: number, bannerSisterFactor: number, fitSisterFactor: number, marketShareThreshold: number) {
    const url = this.rest.getHost() + this.endpoint + '/block-group-web';
    let params = new HttpParams().set('fips', fips);
    params = params.set('project-id', String(projectId));
    params = params.set('banner-sister-factor', String(bannerSisterFactor));
    params = params.set('fit-sister-factor', String(fitSisterFactor));
    params = params.set('market-share-threshold', String(marketShareThreshold));
    return this.http.get(url, {headers: this.rest.getHeaders(), params: params});
  }

  getStoreScores(siteId: number, projectId: number, bannerSisterFactor: number, fitSisterFactor: number, marketShareThreshold: number) {
    const url = this.rest.getHost() + this.endpoint + '/scores';
    let params = new HttpParams().set('site-id', String(siteId));
    params = params.set('project-id', String(projectId));
    params = params.set('banner-sister-factor', String(bannerSisterFactor));
    params = params.set('fit-sister-factor', String(fitSisterFactor));
    params = params.set('market-share-threshold', String(marketShareThreshold));
    return this.http.get(url, {headers: this.rest.getHeaders(), params: params});
  }

  runModel(distanceFactor: number) {
    const url = this.rest.getHost() + this.endpoint + '/run-model';
    let params = new HttpParams().set('project-id', String(187));
    params = params.set('banner-sister-factor', String(0));
    params = params.set('fit-sister-factor', String(0));
    params = params.set('distance-factor', String(distanceFactor));
    return this.http.get(url, {headers: this.rest.getHeaders(), params: params});
  }

}
