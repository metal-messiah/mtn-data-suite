import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestService } from './rest.service';
import { Pageable } from '../../models/pageable';
import { Project } from '../../models/project';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ProjectService {

  private endpoint = '/api/project';

  constructor(private http: HttpClient,
              private rest: RestService) {
  }

  public getAll(projectQuery: string, active: boolean, primaryData: boolean, pageNumber?: number): Observable<Pageable<Project>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    if (projectQuery != null && projectQuery.length > 0) {
      params = params.set('query', projectQuery);
    }
    if (active) {
      params = params.set('active', 'true');
    }
    if (primaryData) {
      params = params.set('primaryData', 'true');
    }
    if (pageNumber != null) {
      params = params.set('page', pageNumber.toLocaleString());
    }
    return this.http.get<Pageable<Project>>(url, {headers: this.rest.getHeaders(), params: params});
  }

}
