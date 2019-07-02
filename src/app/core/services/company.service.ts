import { Injectable } from '@angular/core';
import { Pageable } from '../../models/pageable';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Company } from '../../models/full/company';
import { CrudService } from '../../interfaces/crud-service';
import { RestService } from './rest.service';
import { SimplifiedCompany } from '../../models/simplified/simplified-company';
import { Observable } from 'rxjs';

@Injectable()
export class CompanyService extends CrudService<Company> {
  protected endpoint = '/api/company';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  public getAllByQuery(query?: string, pageNumber?: number, size?: number): Observable<Pageable<SimplifiedCompany>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();

    if (query != null && query.length > 0) {
      params = params.set('name', query);
    }
    if (pageNumber != null) {
      params = params.set('page', pageNumber.toLocaleString());
    }
    params = params.set('size', size ? size.toString() : '500');

    return this.http.get<Pageable<SimplifiedCompany>>(url, { headers: this.rest.getHeaders(), params: params });
  }

  protected createEntityFromObj(entityObj): Company {
    return new Company(entityObj);
  }
}
