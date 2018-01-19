import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RestService} from './rest.service';
import {Pageable} from '../../models/pageable';
import {Observable} from 'rxjs/Observable';
import {Role} from '../../models/role';
import {EntityService} from '../../interfaces/entity-service';

@Injectable()
export class RoleService implements EntityService<Role> {

  private endpoint = '/api/role';

  constructor(private http: HttpClient, private rest: RestService) {
  }

  public getOneById(id: number): Observable<Role> {
    const url = this.rest.getHost() + this.endpoint + `/${id}`;
    return this.http.get<Role>(url, {headers: this.rest.getHeaders()});
  }

  public getAll(): Observable<Pageable<Role>> {
    const url = this.rest.getHost() + this.endpoint;
    return this.http.get<Pageable<Role>>(url, {headers: this.rest.getHeaders()});
  }

  public save(role: Role): Observable<Role> {
    let url = this.rest.getHost() + this.endpoint;
    if (role.id === undefined || role.id === null) {
      return this.http.post<Role>(url, role, {headers: this.rest.getHeaders()});
    }
    url +=  `/${role.id}`;
    return this.http.put<Role>(url, role, {headers: this.rest.getHeaders()});
  }

  public del(role: Role): Observable<Role> {
    const url = this.rest.getHost() + this.endpoint + `/${role.id}`;
    return this.http.delete<Role>(url, {headers: this.rest.getHeaders()});
  }

}
