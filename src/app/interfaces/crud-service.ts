import { Observable } from 'rxjs/Observable';
import { RestService } from '../core/services/rest.service';
import { HttpClient } from '@angular/common/http';
import { Entity } from '../models/entity';

export abstract class CrudService<T extends Entity> {

  protected abstract endpoint;

  protected constructor(protected http: HttpClient, protected rest: RestService) {
  }

  protected abstract createEntityFromObj(entityObj): T;

  create(entity: T): Observable<T> {
    const url = this.rest.getHost() + this.endpoint;
    return this.http.post<T>(url, entity, {headers: this.rest.getHeaders()})
      .map(entityObj => {
        return this.createEntityFromObj(entityObj);
      });
  }

  getOneById(id: number|string): Observable<T> {
    const url = this.rest.getHost() + this.endpoint + `/${id}`;
    return this.http.get<T>(url, {headers: this.rest.getHeaders()})
      .map(entityObj => {
        return this.createEntityFromObj(entityObj);
      });
  }

  update(updatedEntity: T): Observable<T> {
    const url = this.rest.getHost() + this.endpoint + `/${updatedEntity.id}`;
    return this.http.put<T>(url, updatedEntity, {headers: this.rest.getHeaders()})
      .map(entityObj => {
        return this.createEntityFromObj(entityObj);
      });
  }

  delete(entity: T): Observable<any> {
    const url = this.rest.getHost() + this.endpoint + `/${entity.id}`;
    return this.http.delete<T>(url, {headers: this.rest.getHeaders()});
  }
}
