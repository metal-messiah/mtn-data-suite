import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Site } from '../../models/site';

@Injectable()
export class SiteService extends CrudService<Site> {

  protected endpoint = '/api/site';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): Site {
    return new Site(entityObj);
  }

}
