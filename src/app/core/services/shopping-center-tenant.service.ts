import { Injectable } from '@angular/core';
import { CrudService } from '../../interfaces/crud-service';
import { ShoppingCenterTenant } from '../../models/full/shopping-center-tenant';
import { HttpClient } from '@angular/common/http';
import { RestService } from './rest.service';

@Injectable()
export class ShoppingCenterTenantService extends CrudService<ShoppingCenterTenant> {

  protected endpoint = '/api/shopping-center-tenant';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): ShoppingCenterTenant {
    return new ShoppingCenterTenant(entityObj);
  }

}
