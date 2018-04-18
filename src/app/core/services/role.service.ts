import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RestService} from './rest.service';
import {Role} from '../../models/role';
import {CrudService} from '../../interfaces/crud-service';

@Injectable()
export class RoleService extends CrudService<Role> {

  private endpoint = '/api/role';

  constructor(protected http: HttpClient, protected  rest: RestService) {
    super(http, rest);
  }

  protected getEndpoint(): string {
    return this.endpoint;
  }
}
