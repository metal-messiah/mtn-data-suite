import { Injectable } from '@angular/core';
import { Pageable } from '../../models/pageable';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CrudService } from '../../interfaces/crud-service';
import { RestService } from './rest.service';
import { Observable } from 'rxjs';
import { BannerSource } from 'app/models/full/banner-source';

@Injectable()
export class BannerSourceService extends CrudService<BannerSource> {
  protected endpoint = '/api/banner-source';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  public getAllByQuery(query: string, pageNumber?: number, size?: number): Observable<Pageable<BannerSource>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    if (query != null && query.length > 0) {
      params = params.set('query', query);
    }
    if (pageNumber != null) {
      params = params.set('page', pageNumber.toLocaleString());
    }
    if (size) {
      params = params.set('size', size.toString());
    }
    return this.http.get<Pageable<BannerSource>>(url, {headers: this.rest.getHeaders(), params: params});
  }

  protected createEntityFromObj(entityObj): BannerSource {
    return new BannerSource(entityObj);
  }
}
