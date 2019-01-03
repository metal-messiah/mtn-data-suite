import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatStepper } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';

import { SimplifiedCompany } from 'app/models/simplified/simplified-company';
import { SimplifiedBanner } from 'app/models/simplified/simplified-banner';
import { Banner } from 'app/models/full/banner';
import { Company } from 'app/models/full/company';
import { FieldMappingItem } from './field-mapping-item';
import { Store } from '../../../models/full/store';

import { SpreadsheetService } from '../spreadsheet.service';
import { CompanyService } from 'app/core/services/company.service';
import { BannerService } from 'app/core/services/banner.service';
import { StoreService } from 'app/core/services/store.service';

@Component({
	selector: 'mds-assign-fields-dialog',
	templateUrl: './assign-fields-dialog.component.html',
	styleUrls: [ './assign-fields-dialog.component.css' ],
	providers: []
})
export class AssignFieldsDialogComponent implements OnInit {
	title = 'Assign Fields';
	fields: string[];
	spreadsheetService: SpreadsheetService;

	form: FormGroup;

	csvAsText: string;

	sendingData = false;

	matchType: string;

	updateItems: FieldMappingItem[];
	insertItems: FieldMappingItem[];

	companies: SimplifiedCompany[] = [];
	filteredCompanies: SimplifiedCompany[] = [];
	banners: SimplifiedBanner[];

	bannerFetches = 0;

	volumeTypes: string[] = [ 'ACTUAL', 'ESTIMATE', 'PROJECTION', 'THIRD_PARTY', 'PLACEHOLDER' ];

	volumeDate = null;
	volumeType: string = null;

	@ViewChild('stepper') stepper: MatStepper;

	MatDialog;
	constructor(
		public dialogRef: MatDialogRef<AssignFieldsDialogComponent>,
		private fb: FormBuilder,
		private companyService: CompanyService,
		private bannerService: BannerService,
		private storeService: StoreService,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		dialogRef.disableClose = true;

		this.fields = data.fields;
		this.spreadsheetService = data.spreadsheetService;

		this.updateItems = [];

		this.insertItems = [];

		this.csvAsText = data.csvAsText;
		this.sendingData = false;

		this.companies = [];
		this.banners = [];
	}

	ngOnInit() {
		this.createForm();
		this.getCompanies();
	}

	private createForm(): void {
		this.form = this.fb.group({
			name: '',
			lat: '',
			lng: '',
			company: null,
			banner: null,
			storeNumber: '',
			matchType: 'location',
			updateFields: [],
			insertFields: []
		});
	}

	getCompanies(attempts?: number): void {
		// list of companies for input
		attempts = attempts || 0;
		if (attempts < 3) {
			this.companyService.getAllByQuery().subscribe(
				(resp) => {
					this.companies = resp.content.sort((a, b) => a.companyName.localeCompare(b.companyName));
					this.filteredCompanies = this.companies;
				},
				() => this.getCompanies(attempts + 1)
			);
		}
	}

	filterCompanies(value): void {
		// filtering for auto populate input
		value = value || '';
		this.filteredCompanies = this.companies.length
			? this.companies.filter((comp) => {
					return comp.companyName.toLowerCase().includes(value.toLowerCase());
				})
			: [];
	}

	getBannersFromCompany(attempts?: number): void {
		// list of banners based on company selection
		const companyName = this.form.value.company;
		const matches = this.companies.filter((comp) => comp.companyName === companyName);
		let companyId;

		if (matches.length) {
			companyId = matches[0].id;
		}

		if (companyId) {
			attempts = attempts || 0;
			this.banners = [];
			this.bannerFetches = 0;
			if (attempts < 3) {
				this.companyService.getOneById(companyId).subscribe(
					(company: Company) => {
						const { banners } = company;
						attempts = 0;

						this.bannerFetches = banners.length;
						banners.forEach((banner) => {
							this.bannerService.getOneById(banner.id).subscribe(
								(b: Banner) => {
									this.banners.push(b);
								},
								() => this.getBannersFromCompany(attempts + 1) // just a failsafe
							);
						});
					},
					() => this.getBannersFromCompany(attempts + 1) // just a failsafe
				);
			}
		}
	}

	getBanner(bannerId, attempts?: number): void {
		// get full banner obj for the mapping later on
		attempts = attempts || 0;
		if (attempts < 3) {
			this.bannerService.getOneById(bannerId).subscribe(
				(b: Banner) => {
					this.form.value.banner = b;
					console.log(this.form.value);
				},
				() => this.getBannersFromCompany(attempts + 1) // failsafe
			);
		}
	}

	showVolumeFields(item): boolean {
		// some inputs show when storeVolumes is selected
		return item.selectedStoreField === 'storeVolumes';
	}

	updateItemsAreValid(): boolean {
		// update item has full mapping
		let isValid = true;
		this.updateItems.forEach((i) => {
			if (!i.selectedFileField || !i.selectedStoreField) {
				isValid = false;
			}
		});
		if (isValid) {
			this.mapUpdateItemsToForm();
		}
		return isValid;
	}

	insertItemsAreValid(): boolean {
		let isValid = true;
		this.insertItems.forEach((i) => {
			if (!i.selectedFileField || !i.selectedStoreField) {
				isValid = false;
			}
		});
		if (isValid) {
			this.mapInsertItemsToForm();
		}
		return isValid;
	}

	mapUpdateItemsToForm() {
		// place update items in form
		this.form.value.updateFields = this.updateItems.map((i) => {
			return { file: i.selectedFileField, store: i.selectedStoreField };
		});
	}

	mapInsertItemsToForm() {
		this.form.value.insertFields = this.insertItems.map((i) => {
			return { file: i.selectedFileField, store: i.selectedStoreField };
		});
	}

	updateSelectedFileField(id, val, type) {
		const prop = type === 'update' ? 'updateItems' : 'insertItems';
		const idx = this[prop].findIndex((item) => item.id === id);
		this[prop][idx].selectedFileField = val;
	}

	updateSelectedStoreField(id, val: string, type: string) {
		const prop = type === 'update' ? 'updateItems' : 'insertItems';
		const idx = this[prop].findIndex((item) => item.id === id);
		this[prop][idx].selectedStoreField = val;

		if (val === 'storeVolumes') {
			this.volumeDate = new Date();
			this.volumeDate.setMinutes(this.volumeDate.getMinutes() - this.volumeDate.getTimezoneOffset());
			this.volumeDate = this.volumeDate.toISOString().substring(0, 10);

			this.volumeType = this.volumeTypes[0];
		}
	}

	updateVolumeType(type: string): void {
		this.volumeType = type;
	}

	addFieldMappingItem(type: string): void {
		// 'update' or 'insert'
		if (type === 'update') {
			this.updateItems.push(new FieldMappingItem(this.fields));
		} else {
			this.insertItems.push(new FieldMappingItem(this.fields));
		}
	}

	formIsValid(): boolean {
		const step = this.stepper.selectedIndex;
		const { controls, value } = this.form;
		if (step === 0) {
			return controls.name.valid && ((value.lat && value.lng) || (value.company && value.storeNumber));
		}
		if (step === 1) {
			return this.updateItems.length > 0 && this.updateItemsAreValid() && this.insertItemsAreValid();
		}
		return false;
	}

	goForward(): void {
		if (this.stepper.selectedIndex === 1) {
			if (this.formIsValid()) {
				this.assignFields();
			}
		} else {
			this.stepper.next();
		}
	}

	goBackward(): void {
		if (this.stepper.selectedIndex === 0) {
			// window.location.reload();
			this.dialogRef.close('cancel');
		} else {
			this.stepper.reset();
		}
	}

	assignFields(): void {
		// the end of the flow
		this.sendingData = true;
		const volumeRules = {
			volumeDate: this.volumeDate,
			volumeType: this.volumeType
		};

		const matchType = this.form.value.company ? 'storeNumber' : 'location';

		this.spreadsheetService.setMatchType(matchType);

		this.spreadsheetService.assignFields(this.fields, this.form.value, volumeRules);
		this.dialogRef.close();
	}
}
