import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { UserProfile } from '../../models/full/user-profile';
import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Pageable } from '../../models/pageable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import { SimplifiedUserProfile } from 'app/models/simplified/simplified-user-profile';
import { StoreList } from 'app/models/full/store-list';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';

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
        subscriberId?: number,
        storeId?: number,
        pageNumber?: number
    ): Observable<Pageable<SimplifiedStoreList>> {
        const url = this.rest.getHost() + this.endpoint;
        let params = new HttpParams();
        if (pageNumber != null) {
            params = params.set('page', pageNumber.toLocaleString());
        }
        if (subscriberId) {
            params = params.set('subscriber-id', subscriberId.toString());
        }
        if (storeId) {
            params = params.set('store-id', subscriberId.toString());
        }
        return this.http
            .get<Pageable<SimplifiedStoreList>>(url, { headers: this.rest.getHeaders(), params: params })
            .pipe(
                map((page) => {
                    page.content = page.content.map((entityObj) => new SimplifiedStoreList(entityObj));
                    return page;
                })
            );
    }

    addStoresToStoreList(storeListId: number, storeIds: number[]): Observable<SimplifiedStoreList> {
        const url = `${this.rest.getHost()}${this.endpoint}/${storeListId}/add-stores`;
        return this.http.put<SimplifiedStoreList>(url, storeIds, { headers: this.rest.getHeaders() }).pipe(
            map((data) => {
                return new SimplifiedStoreList(data);
            })
        );
    }

    removeStoresFromStoreList(storeListId: number, storeIds: number[]): Observable<SimplifiedStoreList> {
        const url = `${this.rest.getHost()}${this.endpoint}/${storeListId}/removeStores`;
        return this.http.put<SimplifiedStoreList>(url, storeIds, { headers: this.rest.getHeaders() }).pipe(
            map((data) => {
                return new SimplifiedStoreList(data);
            })
        );
    }
}
