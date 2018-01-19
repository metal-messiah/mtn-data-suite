import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RestService} from './rest.service';
import {Observable} from 'rxjs/Observable';
import {Pageable} from '../../models/pageable';
import {Group} from '../../models/group';
import {EntityService} from '../../interfaces/entity-service';

@Injectable()
export class GroupService implements EntityService<Group> {

  private endpoint = '/api/group';

  constructor(private http: HttpClient, private rest: RestService) {
  }

  public getOneById(id: number): Observable<Group> {
    const url = this.rest.getHost() + this.endpoint + `/${id}`;
    return this.http.get<Group>(url, {headers: this.rest.getHeaders()});
  }

  public getAll(): Observable<Pageable<Group>> {
    const url = this.rest.getHost() + this.endpoint;
    return this.http.get<Pageable<Group>>(url, {headers: this.rest.getHeaders()});
  }

  public save(group: Group): Observable<Group> {
    let url = this.rest.getHost() + this.endpoint;
    if (group.id === undefined || group.id === null) {
      return this.http.post<Group>(url, group, {headers: this.rest.getHeaders()});
    }
    url += `/${group.id}`;
    return this.http.put<Group>(url, group, {headers: this.rest.getHeaders()});
  }

  public del(group: Group): Observable<Group> {
    const url = this.rest.getHost() + this.endpoint + `/${group.id}`;
    return this.http.delete<Group>(url, {headers: this.rest.getHeaders()});
  }

}
