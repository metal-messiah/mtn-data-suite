import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  protected createEntityFromObj(entityObj): Role {
    return new Role(entityObj);
  }

  getAllRoles(): Observable<Pageable<SimplifiedRole>> {
    const url = this.rest.getHost() + this.endpoint;
    return this.http.get<Pageable<SimplifiedRole>>(url, {headers: this.rest.getHeaders()})
      .pipe(map(page => {
        page.content = page.content.map(entityObj => new SimplifiedRole(entityObj));
        return page;
      }));
  }
}
