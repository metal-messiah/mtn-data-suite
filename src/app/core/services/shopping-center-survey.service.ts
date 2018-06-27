import { Injectable } from '@angular/core';
import { CrudService } from '../../interfaces/crud-service';
import { ShoppingCenterSurvey } from '../../models/full/shopping-center-survey';
import { HttpClient } from '@angular/common/http';
import { RestService } from './rest.service';
import { ShoppingCenterTenant } from '../../models/full/shopping-center-tenant';
import { ShoppingCenterAccess } from '../../models/full/shopping-center-access';
import { map } from 'rxjs/internal/operators';

@Injectable()
export class ShoppingCenterSurveyService extends CrudService<ShoppingCenterSurvey> {

  protected endpoint = '/api/shopping-center-survey';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): ShoppingCenterSurvey {
    return new ShoppingCenterSurvey(entityObj);
  }

  getAllTenants(surveyId: number) {
    const url = this.rest.getHost() + this.endpoint + `/${surveyId}/tenants`;

    return this.http.get<ShoppingCenterTenant[]>(url, {headers: this.rest.getHeaders()})
      .pipe(map(tenants => tenants.map(tenant => new ShoppingCenterTenant(tenant))));
  }

  getAllAccesses(surveyId: number) {
    const url = this.rest.getHost() + this.endpoint + `/${surveyId}/accesses`;

    return this.http.get<ShoppingCenterAccess[]>(url, {headers: this.rest.getHeaders()})
      .pipe(map(accesses => accesses.map(access => new ShoppingCenterAccess(access))));
  }

  createNewTenants(surveyId: number, tenants: ShoppingCenterTenant[]) {
    const url = this.rest.getHost() + this.endpoint + `/${surveyId}/tenants`;

    return this.http.post<ShoppingCenterTenant[]>(url, tenants, {headers: this.rest.getHeaders()})
      .pipe(map(ts => ts.map(tenant => new ShoppingCenterTenant(tenant))));
  }

  createNewAccess(surveyId: number, access: ShoppingCenterAccess) {
    const url = this.rest.getHost() + this.endpoint + `/${surveyId}/accesses`;

    return this.http.post<ShoppingCenterAccess>(url, access, {headers: this.rest.getHeaders()})
      .pipe(map(a => new ShoppingCenterAccess(a)));
  }
}
