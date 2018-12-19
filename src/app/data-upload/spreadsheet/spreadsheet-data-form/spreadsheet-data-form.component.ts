import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import * as _ from 'lodash';

// models
import { SpreadsheetRecord } from 'app/models/spreadsheet-record';
import { StoreVolume } from 'app/models/full/store-volume';
import { Site } from 'app/models/full/site';
import { SimplifiedSite } from 'app/models/simplified/simplified-site';
import { Store } from 'app/models/full/store';
import { SimplifiedStoreVolume } from 'app/models/simplified/simplified-store-volume';

// services
import { ErrorService } from '../../../core/services/error.service';
import { SiteService } from 'app/core/services/site.service';
import { StoreService } from 'app/core/services/store.service';
import { MapService } from 'app/core/services/map.service';

// components
import { MatDialog, MatSnackBar } from '@angular/material';
import { QuadDialogComponent } from '../../../casing/quad-dialog/quad-dialog.component';
import { NewStoreStatusComponent } from 'app/casing/new-store-status/new-store-status.component';

@Component({
	selector: 'mds-spreadsheet-data-form',
	templateUrl: './spreadsheet-data-form.component.html',
	styleUrls: [ './spreadsheet-data-form.component.css' ]
})
export class SpreadsheetDataFormComponent implements OnChanges, OnInit {
	@Input() dbRecord: Store; // the store that was matched from the map
	@Input() currentRecord: SpreadsheetRecord; // the row from the spreadsheet in object form
	@Input() logic: any; // the mappings of the field/db fields and their corresponding values
	@Input() forceSubmit: boolean; // allows app to force submit with current values from file/db
	@Input() updatedGeom: { lat: number; lng: number }; // updates inputs from markerdrag events

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
		private siteService: SiteService,
		private storeService: StoreService,
		private errorService: ErrorService,
		private fb: FormBuilder,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private mapService: MapService
	) {}

	ngOnInit() {}

	ngOnChanges() {
		if (!this.form) {
			this.createForm();
		}

		// checks to see if the the logic has changed, meaning it will change the form from the logic
		if (this.logic) {
			if (this.logicHistory !== JSON.stringify(this.logic)) {
				this.logicHistory = JSON.stringify(this.logic);
				this.updateFields = this.logic.updates.map((rule) => rule.storeField);
				this.setFormFromLogic();
			}
		}

		// used with autoMatching to force update the record
		if (this.forceSubmit) {
			if (!this.forcedSubmit) {
				this.forcedSubmit = true;
				this.submit();
			}
		}

		// updates the lat/lng inputs on MarkerDrag event
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
		// shows/hides all fields in form html
		this.showAll = !this.showAll;
	}

	getValueFromLogicStoreField(storeField) {
		// logic object contains mappings for the file field <--> db field, and values
		// this function uses the mapping to return the fileValue for the appropriate store field
		// used to populate the appropriate form inputs
		const output = this.logic.updates.filter((rule) => rule.storeField === storeField);
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
		// traverses the dbRecord (store) to return the appropriate attribute
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
		// iterate the mapped update fields and get the matched file values for inputs
		this.updateFields.forEach((storeField) => {
			const formVal = this.form.get(storeField).value;
			if (!formVal) {
				this.form.get(storeField).setValue(this.getValueFromLogicStoreField(storeField));

				if (storeField === 'storeVolumes') {
					this.form.get('volume').setValue(this.getValueFromLogicStoreField(storeField));
				}
			}
		});

		// iterate the store fields (that aren't mapped) and populate the rest of the form
		this.storeFields.forEach((field) => {
			let isValid = true;
			const formItem = this.form.get(field);
			isValid = formItem ? true : false;
			const formVal = isValid ? formItem.value : null;
			if (!formVal && isValid) {
				this.form.get(field).setValue(this.getDbRecordValue(field));
			}
		});

		// make sure the geom inputs are updated from the records/map
		this.updateGeometry();
	}

	updateGeometry() {
		// set the INITIAL geom inputs to match the store/map geometries
		const latForm = this.form.get('lat');
		const lngForm = this.form.get('lng');
		if (!latForm.value) {
			if (this.dbRecord.site.latitude) {
				latForm.setValue(this.dbRecord.site.latitude);
			} else {
				if (this.currentRecord.assignments.lat) {
					const latValue = this.getValueFromLogicStoreField(this.currentRecord.assignments.lat);
					latForm.setValue(latValue);
				} else {
					const latValue = this.mapService.getCenter()['lat'];
					latForm.setValue(latValue);
				}
			}
		}
		if (!lngForm.value) {
			if (this.dbRecord.site.longitude) {
				lngForm.setValue(this.dbRecord.site.longitude);
			} else {
				if (this.currentRecord.assignments.lng) {
					const lngValue = this.getValueFromLogicStoreField(this.currentRecord.assignments.lng);
					latForm.setValue(lngValue);
				} else {
					const lngValue = this.mapService.getCenter()['lng'];
					latForm.setValue(lngValue);
				}
			}
		} else {
			// initial geom already set
		}
	}

	getStoreVolumes() {
		// list of past volumes for the hint text of the storeVolume input HTML
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
		// update the dbRecord attributes to reflect the form inputs
		return new Promise((resolve, reject) => {
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
								// inserting storeVolumes is a separate process from updating the store and the app has to make sure the store exists first
								// set up a listener for the completion event, THEN add the volume
								if (this.updateFields.includes('storeVolumes')) {
									this.completedEvent.subscribe((storeId) => {
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

			// make sure the dbRecord's lat/lng reflects any form changes
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
		// determines whether to show or hide fields (mapped fields, toggle button state, new site, new store, etc all play a role)
		return (
			this.updateFields.includes(field) || this.showAll === true || !this.dbRecord.id || !this.dbRecord.site.id
		);
	}

	submit() {
		// spinner in form
		this.saving = true;
		// loading events outside of form
		this.savingEvent.emit(true);

		// prepare the dbRecord for submission (make sure it matches any form changes)
		this.prepareSubmission().then((store: Store) => {
			if (store.id) {
				// UPDATING EXISTING STORE!
				this.storeService.update(store).pipe(finalize(() => (this.saving = false))).subscribe(
					(result) => {
						this.snackBar
							.open(`Successfully updated record`, 'View', { duration: 4000 })
							.onAction()
							.subscribe(() => {
								window.open(location.origin + '/casing?store-id=' + result.id, '_blank');
							});

						this.finish(store.id);
					},
					(err) =>
						this.errorService.handleServerError(`Failed to update from record!`, err, () =>
							console.log(err)
						)
				);
			} else {
				if (store.site.id) {
					// site exists, store doesnt, CREATE NEW STORE!
					const site = store.site;
					const matches = site['stores'].filter((s) => s.storeType === 'ACTIVE');
					const activeStore = matches.length ? matches[0] : null;
					if (activeStore && this.dbRecord.storeType === 'ACTIVE') {
						// new store is ACTIVE and there already is one in the db
						// must set old store to HISTORICAL, THEN add a new store with ACTIVE
						activeStore.storeType = 'HISTORICAL';
						console.log(activeStore);
						this.storeService.update(activeStore).subscribe((updatedStore) => {
							console.log(updatedStore);
							this.siteService.addNewStore(this.dbRecord.site.id, store).subscribe((result) => {
								this.snackBar
									.open(`Successfully created new record`, 'View', { duration: 4000 })
									.onAction()
									.subscribe(() => {
										window.open(location.origin + '/casing?store-id=' + result.id, '_blank');
									});
								// new stores need a status, open the dialog
								this.addStatus(result.id);
								this.finish(result.id);
							});
						});
					} else {
						// db doesnt already have an active store, just add a new store
						this.siteService.addNewStore(this.dbRecord.site.id, store).subscribe((result) => {
							this.snackBar
								.open(`Successfully created new record`, 'View', { duration: 4000 })
								.onAction()
								.subscribe(() => {
									window.open(location.origin + '/casing?store-id=' + result.id, '_blank');
								});

							// new stores need a status, open the dialog
							this.addStatus(result.id);

							this.finish(result.id);
						});
					}
				} else {
					// site AND store don't exist on server
					// create a new site, THEN create a new store
					const newSite = new Site(store.site);
					this.siteService.create(newSite).subscribe((site: Site) => {
						store.site = new SimplifiedSite(site);

						this.siteService.addNewStore(site.id, store).subscribe((result) => {
							this.snackBar
								.open(`Successfully created new record`, 'View', { duration: 4000 })
								.onAction()
								.subscribe(() => {
									window.open(location.origin + '/casing?store-id=' + result.id, '_blank');
								});

							// new stores need a status, open the dialog
							this.addStatus(result.id);

							this.finish(result.id);
						});
					});
				}
			}
		});
	}

	addVolume(storeId) {
		// this gets triggered after the store has been updated/added
		// inserts volume from form and logic mappings to store record
		if (storeId) {
			const volumeValue = this.form.get('volume').value;
			const volumeDate = new Date(this.logic.volumeRules.volumeDate);
			const storeVolume = new StoreVolume({
				volumeTotal: volumeValue,
				volumeDate: volumeDate,
				volumeType: this.logic.volumeRules.volumeType
			});

			this.storeService.createNewVolume(storeId, storeVolume).subscribe(
				(store) => {
					console.log('updated volume of ', store.id);
				},
				(err) => {
					console.log(err);
				}
			);
		}
	}

	addStatus(storeId) {
		// new stores need a status
		this.dialog.open(NewStoreStatusComponent, { data: { storeId } });
	}

	showQuadDialog() {
		const dialogRef = this.dialog.open(QuadDialogComponent);

		dialogRef.afterClosed().subscribe((quad) => {
			if (typeof quad === 'string' && quad !== '') {
				const ctrl = this.form.get('quad');
				ctrl.setValue(quad);
				ctrl.markAsDirty();
			}
		});
	}

	skip() {
		// allows user to skip the record AND mark it off in the list
		this.finish(null);
	}

	finish(id) {
		// closes the form and lets other components know
		this.completedEvent.emit(id);
		this.savingEvent.emit(false);
		this.resetForm();
	}
}
