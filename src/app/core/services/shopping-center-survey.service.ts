import { Injectable } from '@angular/core';
import { CrudService } from '../../interfaces/crud-service';
import { ShoppingCenterSurvey } from '../../models/shopping-center-survey';
import { HttpClient } from '@angular/common/http';
import { RestService } from './rest.service';
import { ShoppingCenterTenant } from '../../models/shopping-center-tenant';

@Injectable()
export class ShoppingCenterSurveyService extends CrudService<ShoppingCenterSurvey> {

  protected endpoint = '/api/shopping-center-survey';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): ShoppingCenterSurvey {
    return new ShoppingCenterSurvey(entityObj);
  }

  createNewTenant(survey: ShoppingCenterSurvey, tenant: ShoppingCenterTenant) {
    const url = this.rest.getHost() + this.endpoint + `/${survey.id}/tenants`;

    return this.http.post<ShoppingCenterSurvey>(url, tenant, {headers: this.rest.getHeaders()})
      .map(updatedSurvey => {
        return new ShoppingCenterSurvey(updatedSurvey);
      });
  }

  deleteTenant(survey: ShoppingCenterSurvey, tenantId: number) {
    const url = this.rest.getHost() + this.endpoint + `/${survey.id}/tenants/${tenantId}`;

    return this.http.delete<ShoppingCenterSurvey>(url, {headers: this.rest.getHeaders()})
      .map(updatedSurvey => {
        return new ShoppingCenterSurvey(updatedSurvey);
      });
  }
}
