import { Injectable } from '@angular/core';
import { StoreVolume } from '../../models/full/store-volume';
import { CrudService } from '../../interfaces/crud-service';
import { HttpClient } from '@angular/common/http';
import { RestService } from './rest.service';

@Injectable()
export class StoreVolumeService extends CrudService<StoreVolume> {

  protected endpoint = '/api/store-volume';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): StoreVolume {
    return new StoreVolume(entityObj);
  }
}
