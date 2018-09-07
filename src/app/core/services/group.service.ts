import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RestService } from './rest.service';
import { Group } from '../../models/full/group';
import { CrudService } from '../../interfaces/crud-service';
import { Pageable } from '../../models/pageable';
import { SimplifiedGroup } from '../../models/simplified/simplified-group';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';

@Injectable()
export class GroupService extends CrudService<Group> {

  protected endpoint = '/api/group';

  constructor(protected http: HttpClient, protected  rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): Group {
    return new Group(entityObj);
  }

  getAllGroups(): Observable<Pageable<SimplifiedGroup>> {
    const url = this.rest.getHost() + this.endpoint;
    return this.http.get<Pageable<SimplifiedGroup>>(url, {headers: this.rest.getHeaders()})
      .pipe(map(page => {
        page.content = page.content.map(entityObj => new SimplifiedGroup(entityObj));
        return page;
      }));
  }

}
