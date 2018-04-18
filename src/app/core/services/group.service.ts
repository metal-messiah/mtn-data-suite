import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RestService} from './rest.service';
import {Group} from '../../models/group';
import {CrudService} from '../../interfaces/crud-service';

@Injectable()
export class GroupService extends CrudService<Group> {

  private endpoint = '/api/group';

  constructor(protected http: HttpClient, protected  rest: RestService) {
    super(http, rest);
  }

  protected getEndpoint(): string {
    return this.endpoint;
  }
}
