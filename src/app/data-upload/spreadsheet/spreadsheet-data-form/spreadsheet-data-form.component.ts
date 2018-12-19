import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import * as _ from 'lodash';

import { SpreadsheetService } from '../spreadsheet.service';
import { ErrorService } from '../../../core/services/error.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { QuadDialogComponent } from '../../../casing/quad-dialog/quad-dialog.component';
import { SpreadsheetRecord } from 'app/models/spreadsheet-record';
import { Store } from 'app/models/full/store';
import { StoreService } from 'app/core/services/store.service';
import { StoreVolume } from 'app/models/full/store-volume';
import { SimplifiedStoreVolume } from 'app/models/simplified/simplified-store-volume';
import { MapService } from 'app/core/services/map.service';
import { SiteService } from 'app/core/services/site.service';
import { Site } from 'app/models/full/site';
import { SimplifiedSite } from 'app/models/simplified/simplified-site';
import { NewStoreStatusComponent } from 'app/casing/new-store-status/new-store-status.component';

@Component({
	selector: 'mds-spreadsheet-data-form',
	templateUrl: './spreadsheet-data-form.component.html',
	styleUrls: [ './spreadsheet-data-form.component.css' ]
})
export class SpreadsheetDataFormComponent implements OnChanges, OnInit {
	@Input() dbRecord: Store;
	@Input() currentRecord: SpreadsheetRecord;
	@Input() logic: any;
	@Input() forceSubmit: boolean;
	@Input() updatedGeom: { lat: number; lng: number };

	@Output() savingEvent = new EventEmitter<boolean>();
	@Output() cancelEvent = new EventEmitter<void>();
	@Output() completedEvent = new EventEmitter<number>();

	saving = false;

	forcedSubmit = false;

	storeTypes = [ 'HISTORICAL', 'ACTIVE', 'FUTURE', 'HYPOTHETICAL' ];

	dbStatuses = [
		{ displayName: 'Rumored', pgStatusId: -1, rank: 0 },
		{ displayName: 'Strong Rumor', pgStatusId: -1, rank: 0 },
		{ displayName: 'Dead Deal', pgStatusId: 99, rank: 1 },
		{ displayName: 'Proposed', pgStatusId: 2, rank: 1 },
		{ displayName: 'Planned', pgStatusId: 3, rank: 1 },
		{ displayName: 'New Under Construction', pgStatusId: 1, rank: 1 },
		{ displayName: 'Open', pgStatusId: 0, rank: 2 },
		{ displayName: 'Remodel', pgStatusId: -1, rank: 2 },
		{ displayName: 'Temporarily Closed', pgStatusId: -1, rank: 2 },
		{ displayName: 'Closed', pgStatusId: -1, rank: 3 }
	];

	storeFields = [
		'storeName',
		'storeNumber',
		'storeType',
		'dateOpened',
		'areaSales',
		'areaSalesPercentOfTotal',
		'areaTotal',
		'areaIsEstimate',
		'storeVolumes',

		'address',
		'city',
		'county',
		'state',
		'postalCode',
		'quad',
		'intersectionStreetPrimary',
		'intersectionStreetSecondary',
		'floating',
		'naturalFoodsAreIntegrated',
		'storeIsOpen24'
	].sort();

	updateFields = [];

	showAll = false;

	logicHistory: string;

	form: FormGroup;

	constructor(
		private spreadsheetService: SpreadsheetService,
		private siteService: SiteService,
		private storeService: StoreService,
		private errorService: ErrorService,
		private fb: FormBuilder,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private mapService: MapService
	) {}

	ngOnInit() {
		// console.log('FORM INIT');
	}

	ngOnChanges() {
		// console.log('form changes');
		// console.log('(form)', this.logic);
		if (!this.form) {
			this.createForm();
		}

		if (this.logic) {
			if (this.logicHistory !== JSON.stringify(this.logic)) {
				// console.log('new logic detected');
				this.logicHistory = JSON.stringify(this.logic);
				this.updateFields = this.logic.updates.map((rule) => rule.storeField);
				this.setFormFromLogic();
			}
		}

		if (this.forceSubmit) {
			if (!this.forcedSubmit) {
				this.forcedSubmit = true;
				this.submit();
			}
		}

		if (this.updatedGeom) {
			const { lat, lng } = this.updatedGeom;
			const latForm = this.form.get('lat');
			const lngForm = this.form.get('lng');
			if (lat !== latForm.value) {
				latForm.setValue(lat);
			}
			if (lng !== lngForm.value) {
				lngForm.setValue(lng);
			}
		}
	}

	private createForm() {
		// console.log('create form');

		this.form = this.fb.group({
			// store stuff
			shoppingCenterId: null,
			shoppingCenterName: '',
			siteId: null,
			address: '',
			city: '',
			county: '',
			state: '',
			postalCode: '',
			quad: '',
			intersectionStreetPrimary: '',
			intersectionStreetSecondary: '',
			storeId: null,
			storeName: '',
			dateOpened: '',
			storeSurveyId: null,
			areaTotal: '',
			storeStatuses: [],

			areaIsEstimate: false,
			areaSales: '',
			areaSalesPercentOfTotal: null,
			floating: null,
			naturalFoodsAreIntegrated: true,

			storeIsOpen24: false,
			storeNumber: '',
			storeType: 'ACTIVE',
			storeVolumes: [],

			fit: null,

			// site stuff
			lat: { value: null, disabled: true },
			lng: { value: null, disabled: true },

			// volume stuff
			volume: ''
		});
	}

	toggleShowAll() {
		this.showAll = !this.showAll;
	}

	getValueFromLogicStoreField(storeField) {
		let output = this.logic.updates.filter((rule) => rule.storeField === storeField);
		if (!output.length) {
			output = this.logic.inserts.filter((rule) => rule.storeField === storeField);
		}
		if (output.length) {
			if (typeof output[0].storeValue === 'string') {
				return output[0].fileValue;
			} else {
				return Number(output[0].fileValue);
			}
		} else {
			return null;
		}
	}

	getDbRecordValue(attr) {
		if (this.dbRecord[attr]) {
			return this.dbRecord[attr];
		}

		if (attr === 'address') {
			return this.dbRecord.site.address1;
		}
		if (
			attr === 'city' ||
			attr === 'postalCode' ||
			attr === 'state' ||
			attr === 'intersectionStreetPrimary' ||
			attr === 'intersectionStreetSecondary' ||
			attr === 'quad'
		) {
			return this.dbRecord.site[attr];
		}
		return null;
	}

	private setFormFromLogic() {
		// console.log('set form from logic');
		this.updateFields.forEach((storeField) => {
			const formVal = this.form.get(storeField).value;
			if (!formVal) {
				this.form.get(storeField).setValue(this.getValueFromLogicStoreField(storeField));

				if (storeField === 'storeVolumes') {
					this.form.get('volume').setValue(this.getValueFromLogicStoreField(storeField));
				}
			}
		});

		this.storeFields.forEach((field) => {
			let isValid = true;
			const formItem = this.form.get(field);
			isValid = formItem ? true : false;
			const formVal = isValid ? formItem.value : null;
			if (!formVal && isValid) {
				this.form.get(field).setValue(this.getDbRecordValue(field));
			}
		});

		this.updateGeometry();
	}

	updateGeometry() {
		console.log('update geometry');
		const latForm = this.form.get('lat');
		const lngForm = this.form.get('lng');
		if (!latForm.value) {
			if (this.dbRecord.site.latitude) {
				console.log('site lat');
				latForm.setValue(this.dbRecord.site.latitude);
			} else {
				if (this.currentRecord.assignments.lat) {
					console.log('curr record lat');
					const latValue = this.getValueFromLogicStoreField(this.currentRecord.assignments.lat);
					latForm.setValue(latValue);
				} else {
					console.log('map center lat');
					const latValue = this.mapService.getCenter()['lat'];
					latForm.setValue(latValue);
				}
			}
		}
		if (!lngForm.value) {
			if (this.dbRecord.site.longitude) {
				console.log('site lng');
				lngForm.setValue(this.dbRecord.site.longitude);
			} else {
				if (this.currentRecord.assignments.lng) {
					console.log('curr record lng');
					const lngValue = this.getValueFromLogicStoreField(this.currentRecord.assignments.lng);
					latForm.setValue(lngValue);
				} else {
					console.log('map center lng');
					const lngValue = this.mapService.getCenter()['lng'];
					latForm.setValue(lngValue);
				}
			}
		} else {
			console.log('initial geom already set');
		}
	}

	getStoreVolumes() {
		return this.dbRecord.storeVolumes
			.map((v: SimplifiedStoreVolume) => {
				return `$${v.volumeTotal}`;
			})
			.join(', ');
	}

	private resetForm() {
		this.form.reset();
		delete this.form;
	}

	private prepareSubmission() {
		// console.log('prepare submission');
		return new Promise((resolve, reject) => {
			let async = false;
			this.storeFields.forEach((field) => {
				const formItem = this.form.get(field);
				if (formItem) {
					const formVal = formItem.value;
					if (formVal != null && typeof formVal !== 'undefined') {
						switch (field) {
							case 'address':
								this.dbRecord.site.address1 = formVal;
								break;
							case 'city':
							case 'postalCode':
							case 'state':
							case 'intersectionStreetPrimary':
							case 'intersectionStreetSecondary':
							case 'quad':
								this.dbRecord.site[field] = formVal;
								break;
							case 'storeVolumes':
								if (this.updateFields.includes('storeVolumes')) {
									// console.log('STORE VOLUME!');

									async = true;

									this.completedEvent.subscribe((storeId) => {
										console.log('completed event', storeId);
										this.addVolume(storeId);
									});
								}
								break;
							default:
								this.dbRecord[field] = formVal;
						}
					}
				}
			});

			const latForm = this.form.get('lat');
			const lngForm = this.form.get('lng');

			if (latForm.value && this.dbRecord.site.latitude !== latForm.value) {
				this.dbRecord.site.latitude = latForm.value;
			}
			if (lngForm.value && this.dbRecord.site.longitude !== lngForm.value) {
				this.dbRecord.site.longitude = lngForm.value;
			}

			return resolve(this.dbRecord);
		});
	}

	shouldShow(field) {
		return (
			this.updateFields.includes(field) || this.showAll === true || !this.dbRecord.id || !this.dbRecord.site.id
		);
	}

	submit() {
		this.saving = true;

		this.savingEvent.emit(true);

		this.prepareSubmission().then((store: Store) => {
			if (store.id) {
				this.storeService.update(store).pipe(finalize(() => (this.saving = false))).subscribe(
					(result) => {
						console.log('saved store ', store.id);
						this.snackBar
							.open(`Successfully updated record`, 'View', { duration: 4000 })
							.onAction()
							.subscribe(() => {
								window.open(location.origin + '/casing?store-id=' + result.id, '_blank');
							});

						this.finish(store.id);
					},
					(err) =>
						this.errorService.handleServerError(`Failed to update from PG record!`, err, () =>
							console.log(err)
						)
				);
			} else {
				if (store.site.id) {
					// site exists, store doesnt
					const site = store.site;
					const matches = site['stores'].filter((s) => s.storeType === 'ACTIVE');
					const activeStore = matches.length ? matches[0] : null;
					if (activeStore && this.dbRecord.storeType === 'ACTIVE') {
						console.log('new store is ACTIVE and there is already one --> ', activeStore);
						// new store is ACTIVE and there already is one in the db
						activeStore.storeType = 'HISTORICAL';
						this.storeService.update(activeStore).subscribe((updatedStore) => {
							console.log('changed currently active store to historical');
							console.log(updatedStore);
							this.siteService.addNewStore(this.dbRecord.site.id, store).subscribe((result) => {
								console.log('saved store ', result.id);
								this.snackBar
									.open(`Successfully created new record`, 'View', { duration: 4000 })
									.onAction()
									.subscribe(() => {
										window.open(location.origin + '/casing?store-id=' + result.id, '_blank');
									});

								this.finish(result.id);
							});
						});
					} else {
						// db doesnt already have an active store, just add it
						this.siteService.addNewStore(this.dbRecord.site.id, store).subscribe((result) => {
							console.log('saved store ', result.id);
							this.snackBar
								.open(`Successfully created new record`, 'View', { duration: 4000 })
								.onAction()
								.subscribe(() => {
									window.open(location.origin + '/casing?store-id=' + result.id, '_blank');
								});

							this.addStatus(result.id);

							this.finish(result.id);
						});
					}
				} else {
					// site AND store don't exist on server
					const newSite = new Site(store.site);
					this.siteService.create(newSite).subscribe((site: Site) => {
						console.log('created new site', site);
						store.site = new SimplifiedSite(site);

						this.siteService.addNewStore(site.id, store).subscribe((result) => {
							console.log('saved store ', result.id);
							this.snackBar
								.open(`Successfully created new record`, 'View', { duration: 4000 })
								.onAction()
								.subscribe(() => {
									window.open(location.origin + '/casing?store-id=' + result.id, '_blank');
								});

							this.addStatus(result.id);

							this.finish(result.id);
						});
					});
				}
			}
		});
	}

	addVolume(storeId) {
		if (storeId) {
			const volumeValue = this.form.get('volume').value;
			// console.log('volumeValue: ', volumeValue);
			const volumeDate = new Date(this.logic.volumeRules.volumeDate);
			const storeVolume = new StoreVolume({
				volumeTotal: volumeValue,
				volumeDate: volumeDate,
				volumeType: this.logic.volumeRules.volumeType
			});

			this.storeService.createNewVolume(storeId, storeVolume).subscribe(
				(store) => {
					// return resolve(store);
					console.log('updated volume of ', store.id);
				},
				(err) => {
					// return reject();
					console.log(err);
				}
			);
		}
	}

	addStatus(storeId) {
		this.dialog.open(NewStoreStatusComponent, { data: { storeId } });
	}

	getCurrentRecordOpenDate(): string {
		if (this.currentRecord) {
			if (this.currentRecord.attributes.OPENDATE) {
				return new Date(this.currentRecord.attributes.OPENDATE).toDateString();
			} else if (this.currentRecord.attributes.OPENDATEAPPROX) {
				return this.currentRecord.attributes.OPENDATEAPPROX;
			}
		}
		return '';
	}

	showQuadDialog() {
		const dialogRef = this.dialog.open(QuadDialogComponent);

		dialogRef.afterClosed().subscribe((quad) => {
			// // console.log(quad);
			if (typeof quad === 'string' && quad !== '') {
				const ctrl = this.form.get('quad');
				ctrl.setValue(quad);
				ctrl.markAsDirty();
			}
		});
	}

	skip() {
		this.finish(null);
	}

	finish(id) {
		this.completedEvent.emit(id);
		this.savingEvent.emit(false);
		this.resetForm();
	}
}
