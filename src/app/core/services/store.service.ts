import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Store } from '../../models/full/store';
import { Pageable } from '../../models/pageable';
import { SimplifiedStoreStatus } from '../../models/simplified/simplified-store-status';
import { SimplifiedStoreVolume } from '../../models/simplified/simplified-store-volume';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { SimplifiedStoreCasing } from '../../models/simplified/simplified-store-casing';
import { StoreVolume } from '../../models/full/store-volume';
import { StoreSurvey } from '../../models/full/store-survey';
import { ShoppingCenterSurvey } from '../../models/full/shopping-center-survey';
import { StoreCasing } from '../../models/full/store-casing';
import { Observable } from 'rxjs/index';
import { map } from 'rxjs/internal/operators';
import { SimplifiedSite } from '../../models/simplified/simplified-site';

@Injectable()
export class StoreService extends CrudService<Store> {

  protected endpoint = '/api/store';

  private convertStore = map(updatedStore => new Store(updatedStore));

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  getCasingsByStoreId(storeId: number) {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/store-casings`;

    return this.http.get<SimplifiedStoreCasing[]>(url, {headers: this.rest.getHeaders()})
      .pipe(map(list => {
        return list.map((casing) => new SimplifiedStoreCasing(casing))
          .sort((a: SimplifiedStoreCasing, b: SimplifiedStoreCasing) => {
            return b.casingDate.getTime() - a.casingDate.getTime();
          });
      }));
  }

  createNewCasing(storeId: number, casing: StoreCasing) {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/store-casings`;
    return this.http.post<StoreCasing>(url, casing, {headers: this.rest.getHeaders()})
      .pipe(map(newCasing => new StoreCasing(newCasing)));
  }

  getStoresOfTypeInBounds(bounds: {north, south, east, west}, types: string[],
                          includeProjectIds?: boolean): Observable<Pageable<SimplifiedStore>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('size', '300');
    params = params.set('store_types', types.toString());
    _.forEach(bounds, function (value, key) {
      params = params.set(key, value);
    });
    if (includeProjectIds) {
      params = params.set('include_project_ids', 'true');
    }
    return this.http.get<Pageable<SimplifiedStore>>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(map((page) => {
        page.content = page.content.map(store => new SimplifiedStore(store));
        return page;
      }));
  }

  setCurrentStatus(storeId: number, status: SimplifiedStoreStatus) {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/current-store-status/${status.id}`;
    return this.http.put<Store>(url, null, {headers: this.rest.getHeaders()}).pipe(this.convertStore);
  }

  createNewStatus(storeId: number, status: SimplifiedStoreStatus) {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/store-statuses`;
    return this.http.post<Store>(url, status, {headers: this.rest.getHeaders()}).pipe(this.convertStore);
  }

  deleteStatus(storeId: number, status: SimplifiedStoreStatus) {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/store-statuses/${status.id}`;
    return this.http.delete<Store>(url, {headers: this.rest.getHeaders()}).pipe(this.convertStore);
  }

  getAllVolumes(storeId: number) {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/store-volumes`;
    return this.http.get<StoreVolume[]>(url, {headers: this.rest.getHeaders()})
      .pipe(map(volumes => volumes.map(volume => new StoreVolume(volume))));
  }

  createNewVolume(storeId: number, volume: StoreVolume) {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/store-volumes`;

    if (volume.source == null) {
      volume.source = 'MTN Data Suite: Casing';
    }

    return this.http.post<Store>(url, volume, {headers: this.rest.getHeaders()}).pipe(this.convertStore);
  }

  deleteVolume(storeId: number, volume: SimplifiedStoreVolume) {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/store-volumes/${volume.id}`;

    return this.http.delete<Store>(url, {headers: this.rest.getHeaders()}).pipe(this.convertStore);
  }

  updateFloating(storeId: number, isFloat: boolean) {
    const url = this.rest.getHost() + this.endpoint + '/' + storeId;
    const params = new HttpParams().set('is-float', String(isFloat));
    return this.http.put<SimplifiedStore>(url, null, {headers: this.rest.getHeaders(), params})
      .pipe(map(simpleStore => new SimplifiedStore(simpleStore)));
  }

  getLatestStoreSurvey(storeId: number): Observable<StoreSurvey> {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/store-surveys/latest`;
    return this.http.get<StoreSurvey>(url, {headers: this.rest.getHeaders()})
      .pipe(map(storeSurvey => new StoreSurvey(storeSurvey)));
  }


  getLatestShoppingCenterSurvey(storeId: number): Observable<ShoppingCenterSurvey> {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/shopping-center-surveys/latest`;
    return this.http.get<ShoppingCenterSurvey>(url, {headers: this.rest.getHeaders()})
      .pipe(map(shoppingCenterSurvey => new ShoppingCenterSurvey(shoppingCenterSurvey)));
  }

  getLabel(store: Store | SimplifiedStore) {
    let label = null;
    if (store.banner != null) {
      label = store.banner.bannerName;
    } else {
      label = store.storeName;
    }
    if (store.storeNumber != null) {
      label = `${label} (${store.storeNumber})`;
    }
    return label;
  }

  protected createEntityFromObj(entityObj): Store {
    return new Store(entityObj);
  }
}
