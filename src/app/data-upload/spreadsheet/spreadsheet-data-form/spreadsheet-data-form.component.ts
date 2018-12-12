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

	@Output() savingEvent = new EventEmitter<boolean>();
	@Output() cancelEvent = new EventEmitter<void>();
	@Output() completedEvent = new EventEmitter<void>();

	saving = false;

	forcedSubmit = false;

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
	currentStatus: { displayName: string; pgStatusId: number; rank: number };
	pgStatus: { displayName: string; pgStatusId: number; rank: number };
	doAddStatus = false;

	form: FormGroup;

	constructor(
		private spreadsheetService: SpreadsheetService,
		private storeService: StoreService,
		private errorService: ErrorService,
		private fb: FormBuilder,
		private dialog: MatDialog,
		private snackBar: MatSnackBar
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
	}

	private createForm() {
		// console.log('create form');

		this.form = this.fb.group({
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
			storeType: '',
			storeVolumes: [],

			fit: null,

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

									const volumeValue = this.form.get('volume').value;
									// console.log('volumeValue: ', volumeValue);
									const volumeDate = new Date(this.logic.volumeRules.volumeDate);
									const storeVolume = new StoreVolume({
										volumeTotal: volumeValue,
										volumeDate: volumeDate,
										volumeType: this.logic.volumeRules.volumeType
									});
									this.storeService.createNewVolume(this.dbRecord.id, storeVolume).subscribe(
										(store) => {
											return resolve(store);
										},
										(err) => {
											return reject();
										}
									);
								}
								break;
							default:
								this.dbRecord[field] = formVal;
						}
					}
				}
			});

			if (!async) {
				return resolve(this.dbRecord);
			}
		});
	}

	shouldShow(field) {
		return this.updateFields.includes(field) || this.showAll === true;
	}

	submit() {
		this.saving = true;

		this.savingEvent.emit(true);

		this.prepareSubmission().then((store: Store) => {
			this.storeService.update(store).pipe(finalize(() => (this.saving = false))).subscribe(
				(result) => {
					console.log('saved store ', store.id);
					this.snackBar
						.open(`Successfully updated record`, 'View', { duration: 4000 })
						.onAction()
						.subscribe(() => {
							window.open(location.origin + '/casing?store-id=' + result.id, '_blank');
						});

					this.completedEvent.emit();
					this.savingEvent.emit(false);
					this.resetForm();
				},
				(err) =>
					this.errorService.handleServerError(`Failed to update from PG record!`, err, () => console.log(err))
			);
		});
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
}
