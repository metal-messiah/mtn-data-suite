import { Injectable } from '@angular/core';
import { CrudService } from '../../interfaces/crud-service';
import { ShoppingCenter } from '../../models/full/shopping-center';
import { RestService } from './rest.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ShoppingCenterService extends CrudService<ShoppingCenter> {

  protected endpoint = '/api/shopping-center';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): ShoppingCenter {
    return new ShoppingCenter(entityObj);
  }

}
