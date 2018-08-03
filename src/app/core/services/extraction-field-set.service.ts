import { Injectable } from '@angular/core';
import { CrudService } from '../../interfaces/crud-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestService } from './rest.service';
import { map } from 'rxjs/internal/operators';
import { ExtractionFieldSet } from '../../models/full/extraction-field-set';
import { Pageable } from '../../models/pageable';

@Injectable({
  providedIn: 'root'
})
export class ExtractionFieldSetService extends CrudService<ExtractionFieldSet> {

  protected endpoint = '/api/extraction-field-set';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  getAllFieldSets() {
    const url = this.rest.getHost() + this.endpoint;
    const params = new HttpParams().set('size', '100');
    return this.http.get<Pageable<ExtractionFieldSet>>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(map(page => page.content.map(fieldSet => new ExtractionFieldSet(fieldSet))));
  }

  protected createEntityFromObj(entityObj): ExtractionFieldSet {
    return new ExtractionFieldSet(entityObj);
  }


}
