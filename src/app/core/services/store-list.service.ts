import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Pageable } from '../../models/pageable';
import { Observable, Subject } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/internal/operators';
import { StoreList } from 'app/models/full/store-list';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { StoreListSearchType } from '../functionalEnums/StoreListSearchType';
import { SiteMarker } from '../../models/site-marker';

@Injectable()
export class StoreListService extends CrudService<StoreList> {

  protected endpoint = '/api/store-list';

  storeListUpdated$ = new Subject<StoreList>();

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): StoreList {
    return new StoreList(entityObj);
  }

  update(updatedEntity: StoreList): Observable<StoreList> {
    return super.update(updatedEntity).pipe(tap(storeList => this.storeListUpdated$.next(storeList)));
  }

  getSiteMarkersForStoreList(storeListId: number) {
    const url = this.rest.getHost() + this.endpoint + '/' + storeListId + '/marker-data';
    return this.http
      .get<SiteMarker[]>(url, {headers: this.rest.getHeaders()})
      .pipe(map(siteMarkers => siteMarkers.map(sm => new SiteMarker(sm))));
  }

  getStoreLists(options: {
                  includingStoreIds?: number[],
                  excludingStoreIds?: number[],
                  searchType?: StoreListSearchType,
                  pageNumber?: number,
                  size?: number
                }
  ): Observable<Pageable<SimplifiedStoreList>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();

    if (options.includingStoreIds) {
      params = params.set('including-store-ids', options.includingStoreIds.join(','));
    }
    if (options.excludingStoreIds) {
      params = params.set('excluding-store-ids', options.excludingStoreIds.join(','));
    }
    if (options.searchType) {
      params = params.set('search-type', options.searchType.toString());
    }
    if (options.pageNumber) {
      params = params.set('page', options.pageNumber.toLocaleString());
    }
    const size = options.size ? String(options.size) : '100';
    params = params.set('size', size);

    return this.http
      .get<Pageable<SimplifiedStoreList>>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(
        map((page) => {
          page.content = page.content.map((entityObj) => new SimplifiedStoreList(entityObj));
          return page;
        })
      );
  }

  addStoresToStoreList(storeListId: number, storeIds: number[]): Observable<StoreList> {
    const url = `${this.rest.getHost()}${this.endpoint}/${storeListId}/add-stores`;
    return this.http.put<StoreList>(url, storeIds, {headers: this.rest.getHeaders()})
      .pipe(map(data => new StoreList(data)), tap(storeList => this.storeListUpdated$.next(storeList)));
  }

  removeStoresFromStoreList(storeListId: number, storeIds: number[]): Observable<StoreList> {
    const url = `${this.rest.getHost()}${this.endpoint}/${storeListId}/remove-stores`;
    return this.http.put<StoreList>(url, storeIds, {headers: this.rest.getHeaders()})
      .pipe(map(data => new StoreList(data)), tap(storeList => this.storeListUpdated$.next(storeList)));
  }

  renameList(storeListId: number, newListName: string) {
    return this.getOneById(storeListId)
      .pipe(concatMap((sl: StoreList) => {
        sl.storeListName = newListName;
        return this.update(sl);
      }));
  }
}
