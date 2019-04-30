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
  public getNewest(name: string): Observable<ResourceQuota> {
    const url = this.rest.getHost() + this.endpoint + '/newest';
    let params = new HttpParams();
    if (name != null && name.length > 0) {
      params = params.set('name', name);
    }
    return this.http.get<ResourceQuota>(url, { headers: this.rest.getHeaders(), params: params });
  }

  createNewResourceQuota(name) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const rq = new ResourceQuota({
      resourceName: name,
      periodStartDate: firstDay,
      queryCount: 0,
      quotaLimit: 20000
    });
    return this.create(rq)

  }

  protected createEntityFromObj(entityObj): ResourceQuota {
    return new ResourceQuota(entityObj);
  }

}
