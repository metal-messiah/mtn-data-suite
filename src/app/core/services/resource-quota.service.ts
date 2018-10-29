import { Injectable } from '@angular/core';
import { Pageable } from '../../models/pageable';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ResourceQuota } from '../../models/resource-quota';
import { CrudService } from '../../interfaces/crud-service';
import { RestService } from './rest.service';
import { Observable } from 'rxjs';

@Injectable()
export class ResourceQuotaService extends CrudService<ResourceQuota> {

  protected endpoint = '/api/resource-quota';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }
  public getNewest(name: string, pageNumber?: number): Observable<Pageable<ResourceQuota>> {
    const url = this.rest.getHost() + this.endpoint + '/newest';
    let params = new HttpParams();
    if (name != null && name.length > 0) {
      params = params.set('name', name);
    }
    if (pageNumber != null) {
      params = params.set('page', pageNumber.toLocaleString());
    }
    return this.http.get<Pageable<ResourceQuota>>(url, {headers: this.rest.getHeaders(), params: params});
  }

  protected createEntityFromObj(entityObj): ResourceQuota {
    return new ResourceQuota(entityObj);
  }

}
