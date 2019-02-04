import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestService } from '../../core/services/rest.service';
import { PlannedGroceryUpdatable } from '../../models/planned-grocery-updatable';
import { map, tap } from 'rxjs/operators';
import { SimplifiedStore } from '../../models/simplified/simplified-store';

@Injectable()
export class ChainXyService {
	private endpoint = '/api/planned-grocery';

	selectedChain = null;

	constructor(private http: HttpClient, private rest: RestService) {}

	setSelectedChain(chain) {
		this.selectedChain = chain;
		console.log(this.selectedChain);
	}

	getSelectedChain() {
		console.log(this.selectedChain);
		return this.selectedChain;
	}

	updatePGUpdatableFromPGRecord(
		updatable: PlannedGroceryUpdatable,
		pgFeature: { attributes; geometry }
	): PlannedGroceryUpdatable {
		const attr = pgFeature.attributes;
		updatable.address = attr.DESCLOCATION;
		updatable.city = attr.CITY;
		updatable.county = attr.county;
		updatable.state = attr.STATE;
		updatable.postalCode = attr.ZIP;
		updatable.storeName = attr.NAME;
		updatable.areaTotal = attr.SIZESF;
		updatable.dateOpened = attr.OPENDATE;
		updatable.latitude = pgFeature.geometry.y;
		updatable.longitude = pgFeature.geometry.x;
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
		return this.http
			.get<PlannedGroceryUpdatable>(url, { headers: this.rest.getHeaders(), params })
			.pipe(map((record) => new PlannedGroceryUpdatable(record)));
	}

	// If Creating a new store for an existing site
	getUpdatableBySiteId(siteId: number) {
		const url = this.rest.getHost() + this.endpoint + '/updatable';
		const params = new HttpParams().set('site-id', String(siteId));
		return this.http
			.get<PlannedGroceryUpdatable>(url, { headers: this.rest.getHeaders(), params })
			.pipe(map((record) => new PlannedGroceryUpdatable(record)));
	}

	// If Creating a new site + store in an existing shopping center
	getUpdatableByShoppingCenterId(shoppingCenterId: number) {
		const url = this.rest.getHost() + this.endpoint + '/updatable';
		const params = new HttpParams().set('shopping-center-id', String(shoppingCenterId));
		return this.http
			.get<PlannedGroceryUpdatable>(url, { headers: this.rest.getHeaders(), params })
			.pipe(map((record) => new PlannedGroceryUpdatable(record)));
	}

	submitUpdate(update: PlannedGroceryUpdatable) {
		const url = this.rest.getHost() + this.endpoint + '/updatable';
		return this.http
			.post<SimplifiedStore>(url, update, { headers: this.rest.getHeaders() })
			.pipe(map((record) => new SimplifiedStore(record)));
	}

	pingRefresh() {
		const url = this.rest.getHost() + this.endpoint;
		return this.http.post(url, null, { headers: this.rest.getHeaders() });
	}
}
