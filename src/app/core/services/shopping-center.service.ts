import { Injectable } from '@angular/core';
import { CrudService } from '../../interfaces/crud-service';
import { ShoppingCenter } from '../../models/shopping-center';
import { RestService } from './rest.service';
import { HttpClient } from '@angular/common/http';
import { SimplifiedShoppingCenterCasing } from '../../models/simplified-shopping-center-casing';

@Injectable()
export class ShoppingCenterService extends CrudService<ShoppingCenter> {

  protected endpoint = '/api/shopping-center';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  getCasingsByShoppingCenterId(shoppingCenterId: number) {
    const url = this.rest.getHost() + this.endpoint + `/${shoppingCenterId}/shopping-center-casing`;

    return this.http.get<SimplifiedShoppingCenterCasing[]>(url, {headers: this.rest.getHeaders()})
      .map(list => {
        return list.map((casing) => new SimplifiedShoppingCenterCasing(casing))
          .sort((a: SimplifiedShoppingCenterCasing, b: SimplifiedShoppingCenterCasing) => {
            return b.casingDate.getTime() - a.casingDate.getTime();
          });
      });
  }

  protected createEntityFromObj(entityObj): ShoppingCenter {
    return new ShoppingCenter(entityObj);
  }

}
