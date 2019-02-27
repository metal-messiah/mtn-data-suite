import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pageable } from '../../models/pageable';
import { StoreSource } from '../../models/full/store-source';
import { Observable } from 'rxjs';
import { CrudService } from '../../interfaces/crud-service';

@Injectable()
export class StoreSourceService extends CrudService<StoreSource> {
	protected endpoint = '/api/store-source';

	constructor(protected http: HttpClient, protected rest: RestService) {
		super(http, rest);
	}

	getSourcesNotValidated(sourceName?: string, page?: string): Observable<Pageable<StoreSource>> {
		const url = this.rest.getHost() + this.endpoint;
		let params = new HttpParams().set('validated', 'false');
		params = params.set('size', '250');
		params = params.set('page', page || '0');
		if (sourceName) {
			params = params.set('source-name', sourceName);
		}
		return this.http.get<Pageable<StoreSource>>(url, { headers: this.rest.getHeaders(), params: params });
	}

	getSourcesByBannerSourceId(
		bannerSourceId: number,
		page?: string,
		size?: string
	): Observable<Pageable<StoreSource>> {
		const url = this.rest.getHost() + this.endpoint;
		let params = new HttpParams().set('banner-source-id', `${bannerSourceId}`);
		params = params.set('size', size || '250');
		params = params.set('page', page || '0');

		return this.http.get<Pageable<StoreSource>>(url, { headers: this.rest.getHeaders(), params: params });
	}

	protected createEntityFromObj(entityObj): StoreSource {
		return new StoreSource(entityObj);
	}
}
