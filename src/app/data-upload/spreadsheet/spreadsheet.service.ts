import { Injectable } from '@angular/core';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { SpreadsheetRecord } from '../../models/spreadsheet-record';
import { FieldMappingItem } from './assign-fields-dialog/field-mapping-item';
import { SimplifiedCompany } from 'app/models/simplified/simplified-company';
import { Banner } from 'app/models/full/banner';
import { Store } from 'app/models/full/store';
// import * as records from './DFW.json';

@Injectable({
	providedIn: 'root'
})
export class SpreadsheetService {
	uniqueIdLabels = [ 'unique_id', 'uid', 'id' ];
	latLabels = [ 'lat', 'latitude', 'y' ];
	lngLabels = [ 'lng', 'long', 'longitude', 'x' ];
	nameLabels = [ 'name', 'storeName', 'store name' ];

	file: File;
	fileOutput: string;
	fields: string[];

	matchType: string;

	assignments: {
		lat: string;
		lng: string;
		name: string;
		company: SimplifiedCompany;
		banner: Banner;
		storeNumber: string;
		matchType: string;
		updateFields: FieldMappingItem[];
		insertFields: FieldMappingItem[];
	};

	volumeRules;

	loadType: string = null;

	prevalidatedIds: number[] = [];

	public fieldsAreAssigned$: Subject<boolean> = new Subject();
	public loadTypeAssigned$: Subject<boolean> = new Subject();

	public storedProjectId = null;

	constructor() {}

	setStoredProjectId(id) {
		this.storedProjectId = id;
	}

	setFile(file, fileOutput, fields) {
		console.log('set file');
		this.file = file;
		this.fileOutput = fileOutput;
		this.fields = fields;
	}

	setMatchType(type) {
		this.matchType = type;
	}

	setPrevalidatedIds(ids: number[]) {
		this.prevalidatedIds = ids;
	}
	assignLoadType(type: string) {
		console.log('assign load type', type);
		this.loadType = type;
		this.loadTypeAssigned$.next(true);
	}

	cleanFieldname(field) {
		return field.trim().toLowerCase();
	}

	mapToSpreadsheet(csvAsText: string, attempts?: number): Observable<any> {
		attempts = attempts || 0;

		const csvArray = csvAsText.split('\n').map((row) => row.split(','));

		return of(
			csvArray.map((row, i) => {
				// skip the header row
				if (i) {
					const attributes = {};
					this.fields.forEach((field, idx) => {
						attributes[field] = row[idx];
					});

					const isValidated = this.prevalidatedIds.includes(i);
					return new SpreadsheetRecord(
						i,
						Number(row[this.findFieldIndex(this.assignments.lat)]),
						Number(row[this.findFieldIndex(this.assignments.lng)]),
						row[this.findFieldIndex(this.assignments.name)],
						attributes,
						this.assignments,
						isValidated
					);
				}
			})
		);
	}

	getStoreFromBanner(storeNumber) {
		console.log(storeNumber);
		const stores = this.assignments.banner['stores'];
		const matches = stores.filter((s: Store) => s.storeNumber === storeNumber.toString());
		const store = matches.length ? matches[0] : null;

		console.log(store);

		return { lat: store ? store.site.lat : 0, lng: store ? store.site.lng : 0, store: store };
	}

	setFlowParameters() {}

	getFields(csvAsText: string) {
		const fields = csvAsText.split('\n')[0].split(',');
		return fields;
	}

	assignmentsAreValid() {
		return (
			(this.matchType === 'location' && this.assignments.lat && this.assignments.lng) ||
			(this.matchType === 'storeNumber' && this.assignments.banner && this.assignments.storeNumber)
		);
	}

	parseSpreadsheet(csvAsText: string, fields: string[]): Observable<any> {
		if (this.assignmentsAreValid()) {
			return this.mapToSpreadsheet(csvAsText);
		} else {
			return of([]);
		}
	}

	assignFields(
		fields: string[],
		assignments: {
			lat: string;
			lng: string;
			name: string;
			company: SimplifiedCompany;
			banner: Banner;
			storeNumber: string;
			matchType: string;
			updateFields: FieldMappingItem[];
			insertFields: FieldMappingItem[];
		},
		volumeRules: {
			volumeDate: string;
			volumeType: string;
		}
	) {
		this.assignments = assignments;

		console.log(this.assignments);

		this.volumeRules = volumeRules;

		console.log(this.volumeRules);

		this.sendFieldAssignmentStatus();
	}

	findFieldIndex(fieldName) {
		return this.fields.findIndex((field) => field === fieldName);
	}

	sendFieldAssignmentStatus() {
		if (this.assignmentsAreValid()) {
			this.fieldsAreAssigned$.next(true);
		} else {
			this.fieldsAreAssigned$.next(false);
		}
	}
}
