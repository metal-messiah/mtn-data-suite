import { Injectable } from '@angular/core';
import { CrudService } from '../../interfaces/crud-service';
import { ShoppingCenterCasing } from '../../models/full/shopping-center-casing';
import { HttpClient } from '@angular/common/http';
import { RestService } from './rest.service';

@Injectable()
export class ShoppingCenterCasingService extends CrudService<ShoppingCenterCasing> {

  protected endpoint = '/api/shopping-center-casing';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): ShoppingCenterCasing {
    return new ShoppingCenterCasing(entityObj);
  }

}
