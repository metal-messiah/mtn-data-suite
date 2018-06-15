import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { RestService } from './rest.service';
import { CrudService } from '../../interfaces/crud-service';
import { Store } from '../../models/full/store';
import { Pageable } from '../../models/pageable';
import { Observable } from 'rxjs/Observable';
import { SimplifiedStoreStatus } from '../../models/simplified/simplified-store-status';
import { SimplifiedStoreVolume } from '../../models/simplified/simplified-store-volume';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { SimplifiedStoreCasing } from '../../models/simplified/simplified-store-casing';
import { StoreVolume } from '../../models/full/store-volume';
import { StoreSurvey } from '../../models/full/store-survey';
import { ShoppingCenterSurvey } from '../../models/full/shopping-center-survey';

@Injectable()
export class StoreService extends CrudService<Store> {

  protected endpoint = '/api/store';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  getCasingsByStoreId(storeId: number) {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/store-casing`;

    return this.http.get<SimplifiedStoreCasing[]>(url, {headers: this.rest.getHeaders()})
      .map(list => {
        return list.map((casing) => new SimplifiedStoreCasing(casing))
          .sort((a: SimplifiedStoreCasing, b: SimplifiedStoreCasing) => {
            return b.casingDate.getTime() - a.casingDate.getTime();
          });
      });
  }

  getStoresOfTypeInBounds(bounds: any): Observable<Pageable<SimplifiedStore>> {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams().set('size', '300');
    params = params.set('store_type', 'ACTIVE');
    _.forEach(bounds, function (value, key) {
      params = params.set(key, value);
    });
    return this.http.get<Pageable<SimplifiedStore>>(url, {headers: this.rest.getHeaders(), params: params})
      .map((page) => {
        page.content = page.content.map(store => new SimplifiedStore(store));
        return page;
      });
  }

  setCurrentStatus(store: Store, status: SimplifiedStoreStatus) {
    const url = this.rest.getHost() + this.endpoint + `/${store.id}/current-store-status/${status.id}`;

    return this.http.put<Store>(url, null, {headers: this.rest.getHeaders()})
      .map(updatedStore => {
        return new Store(updatedStore);
      });
  }

  createNewStatus(store: Store, status: SimplifiedStoreStatus) {
    const url = this.rest.getHost() + this.endpoint + `/${store.id}/store-statuses`;

    return this.http.post<Store>(url, status, {headers: this.rest.getHeaders()})
      .map(updatedStore => {
        return new Store(updatedStore);
      });
  }

  deleteStatus(store: Store, status: SimplifiedStoreStatus) {
    const url = this.rest.getHost() + this.endpoint + `/${store.id}/store-statuses/${status.id}`;

    return this.http.delete<Store>(url, {headers: this.rest.getHeaders()})
      .map(updatedStore => {
        return new Store(updatedStore);
      });
  }

  getAllVolumes(storeId: number) {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/store-volumes`;
    return this.http.get<SimplifiedStoreVolume[]>(url, {headers: this.rest.getHeaders()})
      .map((volumes: SimplifiedStoreVolume[]) => {
        return volumes.map(volume => new SimplifiedStoreVolume(volume));
      });
  }

  createNewVolume(store: Store, volume: StoreVolume) {
    if (volume.source == null) {
      volume.source = 'MTN Data Suite: Casing';
    }

    const url = this.rest.getHost() + this.endpoint + `/${store.id}/store-volumes`;

    return this.http.post<Store>(url, volume, {headers: this.rest.getHeaders()})
      .map(updatedStore => {
        return new Store(updatedStore);
      });
  }

  deleteVolume(store: Store, volume: SimplifiedStoreVolume) {
    const url = this.rest.getHost() + this.endpoint + `/${store.id}/store-volumes/${volume.id}`;

    return this.http.delete<Store>(url, {headers: this.rest.getHeaders()})
      .map(updatedStore => {
        return new Store(updatedStore);
      });
  }

  getLatestStoreSurvey(storeId: number) {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/store-surveys/latest`;
    return this.http.get<StoreSurvey>(url, {headers: this.rest.getHeaders()})
      .map((storeSurvey: StoreSurvey) => {
        return new StoreSurvey(storeSurvey);
      });
  }



  getLatestShoppingCenterSurvey(storeId: number) {
    const url = this.rest.getHost() + this.endpoint + `/${storeId}/shopping-center-surveys/latest`;
    return this.http.get<ShoppingCenterSurvey>(url, {headers: this.rest.getHeaders()})
      .map((shoppingCenterSurvey: ShoppingCenterSurvey) => {
        return new ShoppingCenterSurvey(shoppingCenterSurvey);
      });
  }

  getLabel(store: Store|SimplifiedStore) {
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
