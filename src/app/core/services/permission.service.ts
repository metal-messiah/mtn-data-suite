import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Pageable } from '../../models/pageable';
import { Permission } from '../../models/full/permission';
import { tap } from 'rxjs/operators';
import { CrudService } from '../../interfaces/crud-service';
import { SimplifiedPermission } from '../../models/simplified/simplified-permission';
import { RestService } from './rest.service';

@Injectable()
export class PermissionService extends CrudService<Permission> {

  protected endpoint = '/api/permission';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  public getPermissions(): Observable<Pageable<Permission>> {
    const url = this.rest.getHost() + this.endpoint;
    const params = new HttpParams().set('size', '100');
    return this.http.get<Pageable<Permission>>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(
        tap(p => console.log(`Fetched ${p['content'].length} permissions.`))
      );
  }

  protected createEntityFromObj(entityObj): Permission {
    return new Permission(entityObj);
  }

}
