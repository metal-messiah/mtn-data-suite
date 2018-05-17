import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../../interfaces/crud-service';
import { StoreCasing } from '../../models/store-casing';

@Injectable()
export class StoreCasingService extends CrudService<StoreCasing> {

  protected endpoint = '/api/store-casing';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): StoreCasing {
    return new StoreCasing(entityObj);
  }

}
