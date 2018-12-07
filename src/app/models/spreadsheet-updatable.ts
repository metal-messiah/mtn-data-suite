import { SimplifiedStoreStatus } from './simplified/simplified-store-status';
import { DateUtil } from '../utils/date-util';
import { StoreSource } from './full/store-source';

export class SpreadsheetUpdatable {
	// Shopping Center
	readonly shoppingCenterId: number;
	shoppingCenterName: string;

	// Site
	readonly siteId: number;
	address: string;
	quad: string;
	intersectionStreetPrimary: string;
	intersectionStreetSecondary: string;
	city: string;
	county: string;
	state: string;
	postalCode: string;
	latitude: number;
	longitude: number;

	// Store
	readonly storeId: number;
	storeName: string;
	dateOpened: Date;

	// Store Status (create a new Simplified store status using the decoded PG Status and PG source edited date)
	// Only a new status (one without an ID) will be regarded when submitted. (Forbids editing of existing status records)
	storeStatuses: SimplifiedStoreStatus[] = [];

	// Store Survey
	readonly storeSurveyId: number;
	areaTotal: number;

	storeSource: StoreSource;

	constructor(obj?: any) {
		if (obj) {
			Object.assign(this, obj);
		}
	}
}
