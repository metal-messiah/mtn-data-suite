import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { RestService } from './rest.service';
import { Pageable } from '../../models/pageable';
import { Project } from '../../models/full/project';
import { CrudService } from '../../interfaces/crud-service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import { Boundary } from '../../models/full/boundary';
import { SimplifiedProject } from '../../models/simplified/simplified-project';
import { ProjectSummary } from '../../models/simplified/project-summary';

@Injectable()
export class ProjectService extends CrudService<Project> {
  protected endpoint = '/api/project';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  public getAllByQuery(
    projectQuery: string,
    active: boolean,
    primaryData: boolean,
    pageNumber?: number,
    all?: boolean
  ): Observable<Pageable<Project>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('sort', 'projectName');
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
    if (all) {
      params = params.set('size', '10000');
    }
    return this.http.get<Pageable<Project>>(url, { headers: this.rest.getHeaders(), params: params }).pipe(
      map(page => {
        page.content = page.content.map(site => new Project(site));
        return page;
      })
    );
  }

  getBoundaryForProject(projectId: number) {
    const url = this.rest.getHost() + this.endpoint + '/' + projectId + '/boundary';
    return this.http.get(url, { observe: 'response', headers: this.rest.getHeaders() }).pipe(
      map((response: HttpResponse<Boundary>) => {
        if (response.status === 204) {
          return null;
        } else {
          return new Boundary(response.body);
        }
      })
    );
  }

  associateBoundaryToProject(projectId: number, boundaryId: number) {
    const url = this.rest.getHost() + this.endpoint + '/' + projectId + '/boundary/' + boundaryId;
    return this.http
      .put<SimplifiedProject>(url, {}, { headers: this.rest.getHeaders() })
      .pipe(map(response => new SimplifiedProject(response)));
  }

  saveBoundaryForProject(projectId: number, boundary: Boundary) {
    const url = this.rest.getHost() + this.endpoint + '/' + projectId + '/boundary';
    return this.http
      .post<SimplifiedProject>(url, boundary, { headers: this.rest.getHeaders() })
      .pipe(map(response => new SimplifiedProject(response)));
  }

  deleteBoundaryForProject(projectId: number) {
    const url = this.rest.getHost() + this.endpoint + '/' + projectId + '/boundary';
    return this.http
      .delete<SimplifiedProject>(url, { headers: this.rest.getHeaders() })
      .pipe(map(response => new SimplifiedProject(response)));
  }

  getAllCasedStoreIds(projectId: number) {
    const url = this.rest.getHost() + this.endpoint + '/' + projectId + '/cased-store-ids';
    return this.http.get<number[]>(url, { headers: this.rest.getHeaders() });
  }

  getProjectSummary(projectId: number) {
    const url = this.rest.getHost() + this.endpoint + '/' + projectId + '/summary';
    return this.http.get<ProjectSummary>(url, { headers: this.rest.getHeaders() });
  }

  protected createEntityFromObj(entityObj): Project {
    return new Project(entityObj);
  }
}
