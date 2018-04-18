import { Observable } from 'rxjs/Observable';
import { Pageable } from '../models/pageable';
import { Entity } from '../models/entity';
import { RestService } from '../core/services/rest.service';
import { HttpClient } from '@angular/common/http';

export abstract class CrudService<T extends Entity> {

  protected constructor(protected http: HttpClient, protected rest: RestService) {
  }

  protected getEndpoint(): string {
    throw new Error('YOU SHOULD NOT USE THE CRUD SERVICE DIRECTLY');
  }

  create(entity: T): Observable<T> {
    const url = this.rest.getHost() + this.getEndpoint();
    return this.http.post<T>(url, entity, {headers: this.rest.getHeaders()});
  }

  getOneById(id: number): Observable<T> {
    const url = this.rest.getHost() + this.getEndpoint() + `/${id}`;
    return this.http.get<T>(url, {headers: this.rest.getHeaders()});
  }

  getAll(): Observable<Pageable<T>> {
    const url = this.rest.getHost() + this.getEndpoint();
    return this.http.get<Pageable<T>>(url, {headers: this.rest.getHeaders()});
  }

  update(updatedEntity: T): Observable<T> {
    console.log('Updating');
    // Get the full version of the entity
    return this.getOneById(updatedEntity.id).flatMap(fullEntity => {
      // Update the full entity object's values with updated entity's values
      Object.keys(updatedEntity).forEach(key => fullEntity[key] = updatedEntity[key]);
      // submit updated full entity to web service for saving
      const url = this.rest.getHost() + this.getEndpoint() + `/${fullEntity.id}`;
      return this.http.put<T>(url, fullEntity, {headers: this.rest.getHeaders()});
    });
  }

  delete(entity: T): Observable<T> {
    const url = this.rest.getHost() + this.getEndpoint() + `/${entity.id}`;
    return this.http.delete<T>(url, {headers: this.rest.getHeaders()});
  }
}
