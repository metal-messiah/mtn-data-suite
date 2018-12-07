import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MapService } from '../../core/services/map.service';
import { StoreMappable } from '../../models/store-mappable';
import { Pageable } from '../../models/pageable';
import { StoreService } from '../../core/services/store.service';
import { SiteService } from '../../core/services/site.service';
import { ErrorService } from '../../core/services/error.service';
import { Coordinates } from '../../models/coordinates';
import { AuthService } from '../../core/services/auth.service';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { SimplifiedSite } from '../../models/simplified/simplified-site';

import { WordSimilarity } from '../../utils/word-similarity';

import { MatSnackBar, MatDialog, MatStepper } from '@angular/material';

import { EntityMapLayer } from '../../models/entity-map-layer';

import { debounceTime, finalize, tap } from 'rxjs/internal/operators';
import { MapDataLayer } from '../../models/map-data-layer';
import { SpreadsheetLayer } from '../../models/spreadsheet-layer';
import { SpreadsheetRecord } from '../../models/spreadsheet-record';
import { SpreadsheetService } from './spreadsheet.service';

import * as _ from 'lodash';
import { StoreMapLayer } from '../../models/store-map-layer';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { SpreadsheetUpdatable } from 'app/models/spreadsheet-updatable';
import { Store } from 'app/models/full/store';
import { stringify } from 'querystring';

import { StorageService } from '../../core/services/storage.service';
import { LoadComponent } from './load/load.component';
import { AssignFieldsDialogComponent } from './assign-fields-dialog/assign-fields-dialog.component';
import { StoredProject } from './storedProject';

@Component({
	selector: 'mds-spreadsheet',
	templateUrl: './spreadsheet.component.html',
	styleUrls: [ './spreadsheet.component.css' ],
	providers: []
})
export class SpreadsheetComponent implements OnInit {
	spreadsheetLayer: SpreadsheetLayer;
	storeMapLayer: EntityMapLayer<StoreMappable>;
	mapDataLayer: MapDataLayer;

	allRecords: SpreadsheetRecord[] = [];
	records: SpreadsheetRecord[] = [];
	currentRecord: SpreadsheetRecord = null;
	currentRecordIndex = 0;

	currentDBSiteResults: SimplifiedSite[];

	readonly storeTypes: string[] = [ 'ACTIVE', 'FUTURE', 'HISTORICAL' ];

	gettingEntities = false;

	wordSimilarity: WordSimilarity;
	bestMatch: { store: object; score: number; distanceFrom: number };

	isFetching = false;
	isAutoMatching = false;

	allowedFileTypes = '.csv';
	outputType = 'text';
	fields: string[] = [];

	file: File;
	fileOutput: string;

	dbRecord: Store;

	openForm = false;

	logic = { updates: [], inserts: [], volumeRules: null };

	storageKey = 'spreadsheets';
	storedProjects: StoredProject[];
	currentProjectId;

	volumeRules: {
		volumeDate: string;
		volumeType: string;
	};

	@ViewChild('stepper') stepper: MatStepper;

	constructor(
		private mapService: MapService,
		private spreadsheetService: SpreadsheetService,
		private ngZone: NgZone,
		private siteService: SiteService,
		private storeService: StoreService,
		private errorService: ErrorService,
		private authService: AuthService,
		private snackBar: MatSnackBar,
		private entitySelectionService: EntitySelectionService,
		private storageService: StorageService,
		public dialog: MatDialog
	) {
		this.wordSimilarity = new WordSimilarity();

		console.log('init');
	}

	ngOnInit() {
		this.storageService.getLocalStorage(this.storageKey, true).subscribe((data) => {
			this.storedProjects = data ? data : {};
			console.log('stored projects', this.storedProjects);
		});

		this.spreadsheetService.fieldsAreAssigned$.subscribe((success: boolean) => {
			if (success) {
				this.buildList('file');
			} else {
				this.openLoadDialog();
			}
		});

		this.spreadsheetService.loadTypeAssigned$.subscribe((success: boolean) => {
			if (success) {
				console.log('load type assigned');
				const type = this.spreadsheetService.loadType;

				if (type === 'file') {
					this.openFieldDialog();
				} else {
					this.buildList('storedProject');
				}
			}
		});

		setTimeout(() => this.openLoadDialog(), 1000);
	}

	buildList(type) {
		if (type === 'file') {
			const { fileOutput, fields } = this.spreadsheetService;

			this.volumeRules = this.spreadsheetService.volumeRules;
			console.log(this.volumeRules);

			this.spreadsheetService.parseSpreadsheet(fileOutput, fields).subscribe((records: SpreadsheetRecord[]) => {
				this.allRecords = records.filter((r) => r);
				this.updateList(false);

				this.createNewProject();
			});
		} else {
			console.log('build list from stored project');
			const storedProjectId = this.spreadsheetService.storedProjectId;
			this.selectProject(storedProjectId);

			const proj = this.getCurrentProject();

			this.allRecords = proj.records.map((record) => {
				return new SpreadsheetRecord(
					record.uniqueId,
					record.coordinates.lat,
					record.coordinates.lng,
					record.displayName,
					record.attributes,
					record.assignments,
					record.validated
				);
			});

			this.volumeRules = proj.volumeRules;

			this.updateList(true);
		}
	}

	updateList(setToNext) {
		return new Promise((resolve, reject) => {
			this.records = this.allRecords.filter((r) => r);

			if (setToNext) {
				this.currentRecordIndex = this.records.findIndex((record) => record.validated === false);
				this.setCurrentSpreadsheetRecord();
			}

			return resolve();
		});
	}

	openLoadDialog() {
		const dialogRef = this.dialog.open(LoadComponent, {
			data: {
				storedProjects: this.storedProjects
			}
		});
	}

	openFieldDialog() {
		console.log('open field dialog');
		this.dialog.open(AssignFieldsDialogComponent, {
			data: {
				fields: this.spreadsheetService.fields,
				spreadsheetService: this.spreadsheetService
			}
		});
	}

	// handleFile(file) {
	// 	// // console.log(file);

	// 	this.file = file.file;
	// 	this.fileOutput = file.fileOutput;

	// 	this.fields = this.spreadsheetService.getFields(file.fileOutput);
	// 	if (this.fields) {
	// 		this.openFieldDialog();
	// 	} else {
	// 		this.snackBar.open('Couldnt Find Fields...');
	// 	}
	// }

	getSpreadsheetContent() {}

	siteHover(store, type) {
		if (type === 'enter' && this.records.length) {
			this.storeMapLayer.selectEntity(store);
		} else {
			this.storeMapLayer.clearSelection();
		}
	}

	setCurrentSpreadsheetRecord(i?: number) {
		console.log('set current spreadsheet record');
		if (i !== null && typeof i !== 'undefined') {
			this.currentRecordIndex = i;
		}
		console.log('SET CURRENT RECORD', i);

		if (this.openForm) {
			this.cancelStep2();
		}

		if (this.currentRecordIndex < this.records.length && this.spreadsheetLayer) {
			this.bestMatch = null;
			this.currentRecord = this.records[this.currentRecordIndex];
			this.currentDBSiteResults = [];
			this.spreadsheetLayer.setRecord(this.currentRecord);
		} else {
			// this.isAutoMatching = false;
			// console.warn('End of Records');
		}

		const elem = document.getElementById(`${this.currentRecordIndex}`);
		if (elem) {
			elem.scrollIntoView({ behavior: 'smooth' });
		}
	}

	onMapReady() {
		this.spreadsheetLayer = new SpreadsheetLayer(this.mapService);
		// console.log(`Map is ready`);
		this.storeMapLayer = new StoreMapLayer(
			this.mapService,
			this.authService,
			this.entitySelectionService.storeIds,
			() => null
		);
		this.mapDataLayer = new MapDataLayer(
			this.mapService.getMap(),
			this.authService.sessionUser.id,
			this.entitySelectionService.siteIds
		);

		this.mapService.boundsChanged$.pipe(debounceTime(1000)).subscribe((bounds: { east; north; south; west }) => {
			// console.log(bounds);
			this.currentDBSiteResults = [];
			this.getEntities(bounds);
		});

		this.setCurrentSpreadsheetRecord();
	}

	getEntities(bounds: { east; north; south; west }): void {
		if (this.mapService.getZoom() > 10) {
			this.mapDataLayer.clearDataPoints();
			this.gettingEntities = true;
			this.getStoresInBounds(bounds).pipe(finalize(() => (this.gettingEntities = false))).subscribe(() =>
				// console.log('Retrieved Entities'),
				(err) => {
					this.ngZone.run(() => {
						this.errorService.handleServerError(`Failed to retrieve entities!`, err, () =>
							// console.log(err),
							() => this.getEntities(bounds)
						);
					});
				}
			);
		} else if (this.mapService.getZoom() > 7) {
			this.getPointsInBounds(bounds);
			this.storeMapLayer.setEntities([]);
		} else {
			this.ngZone.run(() =>
				this.snackBar.open('Zoom in for location data', null, {
					duration: 1000,
					verticalPosition: 'top'
				})
			);
			this.mapDataLayer.clearDataPoints();
			this.storeMapLayer.setEntities([]);
		}
	}

	private getPointsInBounds(bounds) {
		this.siteService.getSitePointsInBounds(bounds).subscribe((sitePoints: Coordinates[]) => {
			// // console.log(sitePoints)
			if (sitePoints.length <= 1000) {
				this.mapDataLayer.setDataPoints(sitePoints);
				this.ngZone.run(() => {
					const message = `Showing ${sitePoints.length} items`;
					this.snackBar.open(message, null, {
						duration: 2000,
						verticalPosition: 'top'
					});
				});
			} else {
				this.ngZone.run(() => {
					const message = `Too many locations, zoom in to see data`;
					this.snackBar.open(message, null, {
						duration: 2000,
						verticalPosition: 'top'
					});
				});
			}
		});
	}

	private getStoresInBounds(bounds) {
		return this.storeService.getStoresOfTypeInBounds(bounds, this.storeTypes, false).pipe(
			tap((list) => {
				// // console.log(page);

				const allMatchingSites = list.map((store) => {
					store.site['stores'] = []; // Used to group stores by site
					return store.site;
				});

				list.forEach((store) => {
					const siteIdx = allMatchingSites.findIndex((site) => site['id'] === store.site.id);
					allMatchingSites[siteIdx]['stores'].push(store);
				});
				this.gettingEntities = false;
				this.currentDBSiteResults = allMatchingSites;

				if (this.currentRecord && this.currentDBSiteResults) {
					const recordName = this.currentRecord.displayName;

					this.currentDBSiteResults.forEach((site: SimplifiedSite) => {
						const crGeom = this.currentRecord.coordinates;
						const dbGeom = { lng: site.longitude, lat: site.latitude };
						// console.log(crGeom, dbGeom);
						const dist = MapService.getDistanceBetween(crGeom, dbGeom);
						site['distanceFrom'] = dist * 0.000621371;

						const heading = MapService.getHeading(crGeom, dbGeom);
						site['heading'] = `rotate(${heading}deg)`; // 0 is up, 90 is right, 180 is down, -90 is left

						site['stores'].forEach((store) => {
							const dbName = store['storeName'];
							// console.log(`SIMILARITY SCORE: ${recordName} & ${dbName}`);
							const score = WordSimilarity.levenshtein(recordName, dbName);

							if (this.bestMatch) {
								if (
									this.bestMatch.score >= score &&
									this.bestMatch['distanceFrom'] >= site['distanceFrom']
								) {
									this.bestMatch = {
										store: store,
										score: score,
										distanceFrom: site['distanceFrom']
									};
								}
							} else {
								this.bestMatch = {
									store: store,
									score: score,
									distanceFrom: site['distanceFrom']
								};
							}
						});
					});

					if (this.bestMatch && this.bestMatch.score <= 4 && this.bestMatch.distanceFrom < 0.1) {
						this.currentRecord.matchedStore = this.bestMatch.store as SimplifiedStore;
						// console.log('MATCHED');
					} else {
						// console.log('NO MATCH: ', this.bestMatch);

						this.currentDBSiteResults.sort((a, b) => {
							return a['distanceFrom'] - b['distanceFrom'];
						});

						this.currentDBSiteResults.forEach((site) => {
							site['stores'].sort((a, b) => {
								return a['storeType'] < b['storeType'] ? -1 : a['storeType'] > b['storeType'] ? 1 : 0;
							});
						});

						this.ngZone.run(() => {
							this.storeMapLayer.setEntities(list);
						});

						// console.log('currentdb', this.currentDBSiteResults);
					}

					if (this.isAutoMatching) {
						this.ngZone.run(() => {
							this.currentRecordIndex++;
							this.setCurrentSpreadsheetRecord();
						});
					}
				}
			})
		);
	}

	cancelStep2() {
		// this.pgUpdatable = null;
		this.logic = null;
		this.openForm = false;
		this.stepper.reset();
		this.stepper.previous();
		this.setSpreadsheetFeature(false);
	}

	findAttributeInStore(attr) {
		// console.log(attr);
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

	private advance(store: Store) {
		// console.log('advance');
		this.dbRecord = store;

		console.log(this.dbRecord);

		const updateFields = this.currentRecord.getUpdateFields(); // [{file: <field name>, store: <field name>}]
		const insertFields = this.currentRecord.getInsertFields();

		const updateFieldResults = updateFields.map((rule: { file: string; store: string }) => {
			const fileValue = this.currentRecord.getAttribute(rule.file);
			// const storeValue = this.dbRecord[rule.store];

			const storeValue = this.findAttributeInStore(rule.store);
			// console.log(storeValue);

			return { storeField: rule.store, fileValue, storeValue };
		});

		const insertFieldResults = insertFields.map((rule: { file: string; store: string }) => {
			const fileValue = this.currentRecord.getAttribute(rule.file);
			const storeValue = this.dbRecord[rule.store];

			return { storeField: rule.store, fileValue, storeValue };
		});

		this.logic = {
			inserts: insertFieldResults,
			updates: updateFieldResults,
			volumeRules: this.volumeRules
		};
		console.log(this.logic.updates);
		this.openForm = true;
		this.stepper.next();
	}

	noMatch() {
		this.setSpreadsheetFeature(true);
		this.advance(new Store({}));
	}

	matchSite(siteId: number) {
		// Create a NEW Store in Site

		this.isFetching = true;

		// console.log('match site here');
		this.siteService.getOneById(siteId).pipe(finalize(() => (this.isFetching = false))).subscribe((site) => {
			// we need to add a new store to this site eventually...
			// this.siteService.addNewStore(new Store())
		});
	}

	matchStore(storeId: number) {
		this.isFetching = true;

		// console.log('match store: ', storeId);

		this.storeService.getOneById(storeId).pipe(finalize(() => (this.isFetching = false))).subscribe((store) => {
			// console.log(store);
			this.advance(store);
		});
	}

	addStore() {}

	nextRecord() {
		// console.log('next record');
		this.setSpreadsheetFeature(false);
		this.currentRecord.setValidated(true);
		this.stepper.reset();
		this.updateList(true).then(() => {
			const currentProject = this.getCurrentProject();
			currentProject.records = this.allRecords;
			currentProject.lastEdited = new Date();
			this.updateCurrentProject(currentProject);
		});
		// this.setCurrentSpreadsheetRecord(0);
		// this.getPGSources();

		// this.storageService.setCookie(this.file.name, this.allRecords, 365).subscribe((success) => {
		// 	console.log('Saved Cookie?', success);
		// });
	}

	setSpreadsheetFeature(draggable: boolean) {
		this.spreadsheetLayer.setRecord(this.currentRecord, draggable);
	}

	getNewProjectId() {
		console.log('get new project id');
		return Object.keys(this.storedProjects).length
			? Math.max.apply(null, Object.keys(this.storedProjects).map((key) => Number(key))) + 1
			: 0;
	}

	createNewProject() {
		console.log('create new project, id --> ', this.currentProjectId);
		const { file } = this.spreadsheetService;
		console.log('file --> ', file);
		const projectId = this.getNewProjectId();
		this.selectProject(projectId);
		this.updateCurrentProject(new StoredProject(file.name, this.allRecords, this.volumeRules));
	}

	selectProject(id) {
		console.log('select project, id --> ', id);
		this.currentProjectId = id;
	}

	getCurrentProject() {
		return this.storedProjects[this.currentProjectId];
	}

	updateCurrentProject(data) {
		console.log('update project, id --> ', this.currentProjectId);
		this.storedProjects[this.currentProjectId] = data;

		this.saveStoredProjects();
	}

	saveStoredProjects() {
		console.log('save projects to memory');
		this.storageService.setLocalStorage(this.storageKey, this.storedProjects, true).subscribe(() => {
			// this.snackBar.open('Saved Progress');
			// console.log(this.storedProjects);
		});
	}
}
