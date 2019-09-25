import { Injectable } from '@angular/core';
import { Pageable } from '../../models/pageable';
import { concatMap, map, tap } from 'rxjs/internal/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CrudService } from '../../interfaces/crud-service';
import { RestService } from './rest.service';
import { Observable } from 'rxjs';
import { Boundary } from 'app/models/full/boundary';
import { SimplifiedUserBoundary } from '../../models/simplified/simplified-user-boundary';

@Injectable()
export class BoundaryService extends CrudService<Boundary> {
  protected endpoint = '/api/boundary';
  protected userEndpoint = '/api/user';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): Boundary {
    return new Boundary(entityObj);
  }

  getBoundaries(): Observable<Pageable<Boundary>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    params = params.set('size', '1000');
    return this.http
      .get<Pageable<Boundary>>(url, {
        headers: this.rest.getHeaders(),
        params: params
      })
      .pipe(
        map(data => {
          return data;
        })
      );
  }

  getUserBoundaries(userId: number): Observable<SimplifiedUserBoundary[]> {
    const url = this.rest.getHost() + '/api/user-boundary';
    const params = new HttpParams().set('user-id', String(userId));
    return this.http
      .get<SimplifiedUserBoundary[]>(url, {
        headers: this.rest.getHeaders(),
        params: params
      })
      .pipe(
        map(data => {
          return data;
        })
      );
  }
}
