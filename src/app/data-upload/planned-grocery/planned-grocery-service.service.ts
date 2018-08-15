import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/index';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestService } from '../../core/services/rest.service';
import { PlannedGroceryUpdatable } from '../../models/planned-grocery-updatable';
import { tap } from 'rxjs/operators';


@Injectable()
export class PlannedGroceryService {

  private endpoint = '/api/planned-grocery';

  constructor(private http: HttpClient,
    private rest: RestService) {
  }

  createUpdatableFromPGFeature(obj) {
    const attr = obj.attributes;
    const updatable: any = {};
    updatable.address = attr.DESCLOCATION;
    updatable.city = attr.CITY;
    updatable.county = attr.county;
    updatable.state = attr.STATE;
    updatable.postalCode = attr.ZIP;
    updatable.storeName = attr.NAME;
    updatable.areaTotal = attr.SIZESF;
    updatable.dateOpened = attr.OPENDATE;

    
    updatable.latitude = obj.geometry.y;
    updatable.longitude = obj.geometry.x;
    updatable.shoppingCenterId = null;
    updatable.shoppingCenterName = null;
    updatable.siteId = null;
    updatable.quad = null;
    updatable.intersectionStreetPrimary = null;
    updatable.intersectionStreetSecondary = null;
    updatable.storeId = null;
    updatable.storeStatuses = [];
    updatable.storeSurveyId = null;

    return updatable;
  }

  getFeatureByObjectId(objectId: string): Observable<any> {
    const url = this.rest.getHost() + this.endpoint + '/' + objectId;
    return this.http.get<any>(url, { headers: this.rest.getHeaders() });
  }

  // If store already exists in Database
  getUpdatableByStoreId(storeId: number) {
    const url = this.rest.getHost() + this.endpoint + '/updatable';
    const params = new HttpParams().set('store-id', String(storeId));
    return this.http.get<PlannedGroceryUpdatable>(url, { headers: this.rest.getHeaders(), params })
      .pipe(tap(record => new PlannedGroceryUpdatable(record)));
  }

  // If Creating a new store for an existing site
  getUpdatableBySiteId(siteId: number) {
    const url = this.rest.getHost() + this.endpoint + '/updatable';
    const params = new HttpParams().set('site-id', String(siteId));
    return this.http.get<PlannedGroceryUpdatable>(url, { headers: this.rest.getHeaders(), params })
      .pipe(tap(record => new PlannedGroceryUpdatable(record)));
  }

  // If Creating a new site + store in an existing shopping center
  getUpdatableByShoppingCenterId(shoppingCenterId: number) {
    const url = this.rest.getHost() + this.endpoint + '/updatable';
    const params = new HttpParams().set('shopping-center-id', String(shoppingCenterId));
    return this.http.get<PlannedGroceryUpdatable>(url, { headers: this.rest.getHeaders(), params })
      .pipe(tap(record => new PlannedGroceryUpdatable(record)));
  }

  submitUpdate(update: PlannedGroceryUpdatable) {
    const url = this.rest.getHost() + this.endpoint + '/updatable';
    return this.http.post<PlannedGroceryUpdatable>(url, update, { headers: this.rest.getHeaders() })
      .pipe(tap(record => new PlannedGroceryUpdatable(record)));
  }

}
