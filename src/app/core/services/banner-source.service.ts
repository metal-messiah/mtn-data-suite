import { Injectable } from '@angular/core';
import { Pageable } from '../../models/pageable';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CrudService } from '../../interfaces/crud-service';
import { RestService } from './rest.service';
import { Observable } from 'rxjs';
import { BannerSource } from 'app/models/full/banner-source';
import { BannerSourceSummary } from '../../models/full/banner-source-summary';

@Injectable()
export class BannerSourceService extends CrudService<BannerSource> {
  protected endpoint = '/api/banner-source';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  getAllByQuery(queryParams: object, pageNumber?: number, size?: number): Observable<Pageable<BannerSourceSummary>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    if (queryParams) {
      Object.keys(queryParams).forEach(queryParamsKey => {
        params = params.set(queryParamsKey, queryParams[queryParamsKey]);
      });
    }
    if (pageNumber != null) {
      params = params.set('page', pageNumber.toLocaleString());
    }
    if (size) {
      params = params.set('size', size.toString());
    }
    return this.http.get<Pageable<BannerSourceSummary>>(url, {headers: this.rest.getHeaders(), params: params});
  }

  assignBanner(bannerSourceId: number, bannerId: number) {
    const url = this.rest.getHost() + this.endpoint + `/` + bannerSourceId + '/banner/' + bannerId;
    return this.http.put<BannerSource>(url, null, {headers: this.rest.getHeaders()});
  }

  unassignBanner(bannerSourceId: number) {
    const url = this.rest.getHost() + this.endpoint + `/` + bannerSourceId + '/banner';
    return this.http.delete<BannerSource>(url, {headers: this.rest.getHeaders()});
  }

  protected createEntityFromObj(entityObj): BannerSource {
    return new BannerSource(entityObj);
  }
}
