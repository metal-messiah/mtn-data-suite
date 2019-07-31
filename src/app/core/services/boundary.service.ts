import { Injectable } from '@angular/core';
import { Pageable } from '../../models/pageable';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CrudService } from '../../interfaces/crud-service';
import { RestService } from './rest.service';
import { Observable } from 'rxjs';
import { Boundary } from 'app/models/full/boundary';

@Injectable()
export class BoundaryService extends CrudService<Boundary> {

  protected endpoint = '/api/banner';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): Boundary {
    return new Boundary(entityObj);
  }

}
