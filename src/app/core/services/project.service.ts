import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestService } from './rest.service';
import { Pageable } from '../../models/pageable';
import { Project } from '../../models/full/project';
import { CrudService } from '../../interfaces/crud-service';
import { Observable } from 'rxjs/index';
import { map } from 'rxjs/internal/operators';

@Injectable()
export class ProjectService extends CrudService<Project> {

  protected endpoint = '/api/project';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  public getAllByQuery(projectQuery: string, active: boolean, primaryData: boolean, pageNumber?: number): Observable<Pageable<Project>> {
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
    return this.http.get<Pageable<Project>>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(map((page) => {
        page.content = page.content.map(site => new Project(site));
        return page;
      }));
  }

  protected createEntityFromObj(entityObj): Project {
    return new Project(entityObj);
  }

}
