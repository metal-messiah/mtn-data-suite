import { Injectable } from '@angular/core';
import { CrudService } from '../../interfaces/crud-service';
import { StoreSurvey } from '../../models/full/store-survey';
import { HttpClient } from '@angular/common/http';
import { RestService } from './rest.service';

@Injectable()
export class StoreSurveyService extends CrudService<StoreSurvey> {

  protected endpoint = '/api/store-survey';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): StoreSurvey {
    return new StoreSurvey(entityObj);
  }

}
