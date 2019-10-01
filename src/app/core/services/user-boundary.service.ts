import { Injectable } from '@angular/core';
import { Pageable } from '../../models/pageable';
import { concatMap, map, tap } from 'rxjs/internal/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CrudService } from '../../interfaces/crud-service';
import { RestService } from './rest.service';
import { Observable } from 'rxjs';
import { Boundary } from 'app/models/full/boundary';
import { UserBoundary } from 'app/models/full/user-boundary';

@Injectable()
export class UserBoundaryService extends CrudService<UserBoundary> {
  protected endpoint = '/api/user-boundary';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): UserBoundary {
    return new UserBoundary(entityObj);
  }

  getUserBoundaries(userId: number): Observable<UserBoundary[]> {
    const url = this.rest.getHost() + this.endpoint;
    const params = new HttpParams().set('user-id', `${userId}`);
    return this.http
      .get<UserBoundary[]>(url, {
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
