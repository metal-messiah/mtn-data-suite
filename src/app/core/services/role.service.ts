import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RestService} from './rest.service';
import {Pageable} from '../../models/pageable';
import {Observable} from 'rxjs/Observable';
import {Role} from '../../models/role';
import {tap} from 'rxjs/operators';

@Injectable()
export class RoleService {

  private endpoint = '/api/role';

  constructor(private http: HttpClient, private rest: RestService) {
  }

  public getRole(id: number): Observable<Role> {
    const url = this.rest.getHost() + this.endpoint + `/${id}`;
    return this.http.get<Role>(url, {headers: this.rest.getHeaders()})
      .pipe(
        tap( u => console.log(`Successfully retrieved role with id: ${u['id']}`))
      );
  }

  public getRoles(): Observable<Pageable<Role>> {
    const url = this.rest.getHost() + this.endpoint;
    return this.http.get<Pageable<Role>>(url, {headers: this.rest.getHeaders()})
      .pipe(
        tap( p => console.log(`Fetched ${p['content'].length} roles.`))
      );
  }

  public saveRole(role: Role): Observable<Role> {
    let url = this.rest.getHost() + this.endpoint;
    if (role.id === undefined || role.id === null) {
      return this.http.post<Role>(url, role, {headers: this.rest.getHeaders()});
    }
    url +=  `/${role.id}`;
    return this.http.put<Role>(url, role, {headers: this.rest.getHeaders()});
  }

  public deleteRole(role: Role): Observable<Role> {
    const url = this.rest.getHost() + this.endpoint + `/${role.id}`;
    return this.http.delete<Role>(url, {headers: this.rest.getHeaders()});
  }

}
