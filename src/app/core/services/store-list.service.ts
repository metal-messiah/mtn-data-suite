import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Pageable } from '../../models/pageable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import { StoreList } from 'app/models/full/store-list';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { StoreListSearchType } from '../functionalEnums/StoreListSearchType';

@Injectable()
export class StoreListService extends CrudService<StoreList> {
  protected endpoint = '/api/store-list';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): StoreList {
    return new StoreList(entityObj);
  }

  getStoreLists(
    subscriberIds?: number[],
    createdById?: number,
    includingStoreIds?: number[],
    excludingStoreIds?: number[],
    searchType?: StoreListSearchType,
    pageNumber?: number
  ): Observable<Pageable<SimplifiedStoreList>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();

    if (subscriberIds) {
      params = params.set('subscriber-ids', subscriberIds.join(','));
    }
    if (createdById) {
      params = params.set('created-by-id', createdById.toString());
    }
    if (includingStoreIds) {
      params = params.set('including-store-ids', includingStoreIds.join(','));
    }
    if (excludingStoreIds) {
      params = params.set('excluding-store-ids', excludingStoreIds.join(','));
    }
    if (searchType) {
      params = params.set('search-type', searchType.toString());
    }
    if (pageNumber != null) {
      params = params.set('page', pageNumber.toLocaleString());
    }

    params = params.set('size', '100');
    return this.http
      .get<Pageable<SimplifiedStoreList>>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(
        map((page) => {
          page.content = page.content.map((entityObj) => new SimplifiedStoreList(entityObj));
          return page;
        })
      );
  }

  addStoresToStoreList(storeListId: number, storeIds: number[]): Observable<SimplifiedStoreList> {
    const url = `${this.rest.getHost()}${this.endpoint}/${storeListId}/add-stores`;
    return this.http.put<SimplifiedStoreList>(url, storeIds, {headers: this.rest.getHeaders()}).pipe(
      map((data) => {
        return new SimplifiedStoreList(data);
      })
    );
  }

  removeStoresFromStoreList(storeListId: number, storeIds: number[]): Observable<SimplifiedStoreList> {
    const url = `${this.rest.getHost()}${this.endpoint}/${storeListId}/remove-stores`;
    return this.http.put<SimplifiedStoreList>(url, storeIds, {headers: this.rest.getHeaders()}).pipe(
      map((data) => {
        return new SimplifiedStoreList(data);
      })
    );
  }
}
