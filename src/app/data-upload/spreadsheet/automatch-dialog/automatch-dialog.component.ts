import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { SpreadsheetService } from '../spreadsheet.service';
import { SpreadsheetRecord } from 'app/models/spreadsheet-record';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { StoreService } from 'app/core/services/store.service';
import { AutomatchItem } from './automatchItem';
import { Store } from 'app/models/full/store';

@Component({
	selector: 'mds-automatch-dialog',
	templateUrl: './automatch-dialog.component.html',
	styleUrls: [ './automatch-dialog.component.css' ]
})
export class AutomatchDialogComponent implements OnInit {
	records: SpreadsheetRecord[];

	automatchQueue: AutomatchItem[];

	saving = false;

	initialized = false;

	promises: Promise<any>[] = [];

	validatedIds: number[] = [];

	constructor(
		public dialogRef: MatDialogRef<AutomatchDialogComponent>,
		public spreadsheetService: SpreadsheetService,
		private storeService: StoreService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		const { fileOutput, fields, volumeRules } = this.spreadsheetService;
		this.spreadsheetService.parseSpreadsheet(fileOutput, fields).subscribe((records: SpreadsheetRecord[]) => {
			this.records = records.filter((r) => r);

			this.automatchQueue = [];
			this.records.forEach((record) => {
				const promise = this.getAutomatchPromise(record);
				if (promise) {
					this.promises.push(promise);
				}
			});

			// Wait for all the store records to return
			Promise.all(this.promises).then((responses) => {
				responses.forEach((s, i) => {
					const dbRecord = s;
					const currentRecord = this.records[i];

					const logic = this.buildLogic(currentRecord, dbRecord);

					const automatchItem: AutomatchItem = new AutomatchItem(currentRecord, dbRecord, logic);

					this.automatchQueue.push(automatchItem);
				});

				this.initialized = true;
			});
		});
	}

	close(): void {
		this.dialogRef.close();
	}

	getMatched(): number {
		return this.records.filter((r) => r.validated).length;
	}

	getAutomatchPromise(currentRecord: SpreadsheetRecord): Promise<any> {
		const bannerStores: SimplifiedStore[] = currentRecord.assignments.banner['stores'].filter((s) => s.storeNumber);
		let matchingStore: SimplifiedStore;
		const storeNumberField = currentRecord.assignments.storeNumber;
		const storeNumberValue = currentRecord.getAttribute(storeNumberField);
		const matches = bannerStores.filter((s) => {
			try {
				return s.storeNumber ? s.storeNumber.trim() === storeNumberValue.trim() : false;
			} catch (e) {
				return false;
			}
		});

		if (matches.length) {
			matchingStore = matches[0];
		}

		if (matchingStore) {
			return this.storeService.getOneById(matchingStore.id).toPromise();
		}
	}

	buildLogic(currentRecord: SpreadsheetRecord, dbRecord: Store) {
		// get the list of fields matched in the opening dialogs
		const updateFields = currentRecord.getUpdateFields(); // [{file: <field name>, store: <field name>}]
		const insertFields = currentRecord.getInsertFields();

		// get the values from the csv data and the store data and map them to the matched field
		const updateFieldResults = updateFields.map((rule: { file: string; store: string }) => {
			const fileValue = currentRecord.getAttribute(rule.file);
			const storeValue = this.findAttributeInStore(dbRecord, rule.store);
			return { storeField: rule.store, fileValue, storeValue };
		});

		const insertFieldResults = insertFields.map((rule: { file: string; store: string }) => {
			const fileValue = currentRecord.getAttribute(rule.file);
			const storeValue = this.findAttributeInStore(dbRecord, rule.store);

			return { storeField: rule.store, fileValue, storeValue };
		});

		// logic controls how the form behaves
		const logic = {
			inserts: insertFieldResults,
			updates: updateFieldResults,
			volumeRules: this.spreadsheetService.volumeRules
		};

		return logic;
	}

	findAttributeInStore(dbRecord: Store, attr: string) {
		if (dbRecord[attr]) {
			return dbRecord[attr];
		}

		if (attr === 'address') {
			return dbRecord.site.address1;
		}
		if (
			attr === 'city' ||
			attr === 'postalCode' ||
			attr === 'state' ||
			attr === 'intersectionStreetPrimary' ||
			attr === 'intersectionStreetSecondary' ||
			attr === 'quad'
		) {
			return dbRecord.site[attr];
		}
		return null;
	}

	determineAction(): string {
		if (this.getMatched() === this.records.length) {
			return 'All Records Have Been Matched';
		}

		const { lat, lng } = this.spreadsheetService.assignments;

		if (lat && lng) {
			return 'Some Records Could Not Be Matched.  Click \'Proceed\' To Match By Location';
		}
		return 'Some Records Could Not Be Matched. File Must Have Location Data (lat/lng) To Match By Location.';
	}

	isSaving(val): void {
		this.saving = val;
	}

	cancel() {
		// console.log('cancel');
	}

	complete(index): void {
		this.automatchQueue[index].record.setValidated(true);

		this.validatedIds.push(this.automatchQueue[index].record.uniqueId);

		if (!this.automatchQueue.filter((item) => !item.record.validated).length) {
			// all items have been validated
			console.log('ALL ITEMS HAVE BEEN VALIDATED!');
		}
	}

	saveAll(): void {
		this.saving = true;
		const needsValidation = this.automatchQueue.filter((r) => !r.record.validated);

		needsValidation.forEach((record) => {
			record.forcedSubmit = true;
		});
	}

	proceed(): void {
		this.spreadsheetService.setPrevalidatedIds(this.validatedIds);

		this.spreadsheetService.setMatchType('location');
		this.spreadsheetService.sendFieldAssignmentStatus();

		this.dialogRef.close();
	}
}
