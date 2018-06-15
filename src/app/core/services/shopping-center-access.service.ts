import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { ShoppingCenterAccess } from '../../models/full/shopping-center-access';

@Injectable()
export class ShoppingCenterAccessService extends CrudService<ShoppingCenterAccess> {

  protected endpoint = '/api/shopping-center-access';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): ShoppingCenterAccess {
    return new ShoppingCenterAccess(entityObj);
  }

}
