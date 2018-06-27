import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pageable } from '../../models/pageable';
import { Permission } from '../../models/full/permission';
import { CrudService } from '../../interfaces/crud-service';
import { RestService } from './rest.service';
import { Observable } from 'rxjs/index';

@Injectable()
export class PermissionService extends CrudService<Permission> {

  protected endpoint = '/api/permission';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  public getPermissions(): Observable<Pageable<Permission>> {
    const url = this.rest.getHost() + this.endpoint;
    const params = new HttpParams().set('size', '100');
    return this.http.get<Pageable<Permission>>(url, {headers: this.rest.getHeaders(), params: params});
  }

  protected createEntityFromObj(entityObj): Permission {
    return new Permission(entityObj);
  }

}
