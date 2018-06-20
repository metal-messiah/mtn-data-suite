import { Injectable } from '@angular/core';
import { Pageable } from '../../models/pageable';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Banner } from '../../models/full/banner';
import { CrudService } from '../../interfaces/crud-service';
import { RestService } from './rest.service';
import { SimplifiedBanner } from '../../models/simplified/simplified-banner';

@Injectable()
export class BannerService extends CrudService<Banner> {

  protected endpoint = '/api/banner';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }
  public getAllByQuery(query: string, pageNumber?: number): Observable<Pageable<SimplifiedBanner>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    if (query != null && query.length > 0) {
      params = params.set('query', query);
    }
    if (pageNumber != null) {
      params = params.set('page', pageNumber.toLocaleString());
    }
    return this.http.get<Pageable<SimplifiedBanner>>(url, {headers: this.rest.getHeaders(), params: params});
  }

  protected createEntityFromObj(entityObj): Banner {
    return new Banner(entityObj);
  }

}
