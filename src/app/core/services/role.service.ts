import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestService } from './rest.service';
import { Role } from '../../models/full/role';
import { CrudService } from '../../interfaces/crud-service';
import { Pageable } from '../../models/pageable';
import { SimplifiedRole } from '../../models/simplified/simplified-role';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';

@Injectable()
export class RoleService extends CrudService<Role> {

  protected endpoint = '/api/role';

  constructor(protected http: HttpClient, protected  rest: RestService) {
    super(http, rest);
  }

  getAllRoles(): Observable<Pageable<SimplifiedRole>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('size', '1000');
    params = params.set('sort', 'displayName');
    return this.http.get<Pageable<SimplifiedRole>>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(map(page => {
        page.content = page.content.map(entityObj => new SimplifiedRole(entityObj));
        return page;
      }));
  }

  updateRolePermissions(roleId: number, permissionIds: number[]) {
    const url = this.rest.getHost() + this.endpoint + '/' + roleId + '/permissions';
    return this.http.put<Role>(url, permissionIds, {headers: this.rest.getHeaders()})
      .pipe(map(role => new Role(role)));
  }

  protected createEntityFromObj(entityObj): Role {
    return new Role(entityObj);
  }
}
