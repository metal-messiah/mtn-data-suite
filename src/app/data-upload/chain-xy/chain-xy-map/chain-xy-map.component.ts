import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar, MatStepper } from '@angular/material';
import { debounceTime, finalize, tap } from 'rxjs/internal/operators';
import * as _ from 'lodash';

import { StoreSourceService } from '../../../core/services/store-source.service';
import { MapService } from '../../../core/services/map.service';
import { StoreService } from '../../../core/services/store.service';
import { SiteService } from '../../../core/services/site.service';
import { ErrorService } from '../../../core/services/error.service';
import { AuthService } from '../../../core/services/auth.service';

import { WordSimilarity } from '../../../utils/word-similarity';

import { StoreMappable } from '../../../models/store-mappable';
import { PgMappable } from '../../../models/pg-mappable';
import { Pageable } from '../../../models/pageable';
import { Coordinates } from '../../../models/coordinates';
import { PlannedGroceryLayer } from '../../../models/planned-grocery-layer';
import { EntityMapLayer } from '../../../models/entity-map-layer';
import { MapDataLayer } from '../../../models/map-data-layer';
import { SourceUpdatable } from '../../../models/source-updatable';
import { StoreSource } from '../../../models/full/store-source';

import { ChainXyService } from '../chain-xy-service.service';
import { StoreMapLayer } from '../../../models/store-map-layer';
import { EntitySelectionService } from '../../../core/services/entity-selection.service';
import { ChainXyLayer } from 'app/models/chain-xy-layer.';
import { ChainXyMappable } from 'app/models/chain-xy-mappable';
import { Router } from '@angular/router';
import { BannerSource } from 'app/models/full/banner-source';
import { ChainXy } from 'app/models/chain-xy';
import { SourceUpdatableService } from 'app/core/services/source-updatable.service';

@Component({
	selector: 'mds-chain-xy-map',
	templateUrl: './chain-xy-map.component.html',
	styleUrls: [ './chain-xy-map.component.css' ],
	providers: []
})
export class ChainXyMapComponent implements OnInit {
	// Mapping
	chainXyMapLayer: ChainXyLayer;
	storeMapLayer: EntityMapLayer<StoreMappable>;
	mapDataLayer: MapDataLayer;

	// StoreSource to-do list
	records: StoreSource[];
	currentStoreSource: StoreSource;
	currentRecordIndex: number;
	totalStoreSourceRecords: number;

	// Planned Grocery Data
	chainXyRecord: ChainXy;

	// Database Data (Potential Matches)
	currentDBResults: object[];

	// Working record (used for data editing)
	sourceUpdatable: SourceUpdatable;

	bestMatch: { store: object; score: number; distanceFrom: number };

	// Flags
	gettingEntities = false;
	isFetching = false;
	isRefreshing = false;

	selectedBannerSource: BannerSource;

	loadType: string;

	// Reference Values
	storeTypes: string[] = [ 'ACTIVE', 'FUTURE', 'HISTORICAL' ];
	statuses = {
		0: { pg: 'Built', db: 'Open' },
		1: { pg: 'Under Construction', db: 'New Under Construction' },
		2: { pg: 'Proposed', db: 'Proposed' },
		3: { pg: 'Planned', db: 'Planned' },
		99: { pg: 'Dead Deal', db: 'Dead Deal' }
	};

	@ViewChild('stepper') stepper: MatStepper;

	constructor(
		private sourceService: StoreSourceService,
		private mapService: MapService,
		private chainXyService: ChainXyService,
		private _formBuilder: FormBuilder,
		private ngZone: NgZone,
		private siteService: SiteService,
		private storeService: StoreService,
		private errorService: ErrorService,
		private authService: AuthService,
		private snackBar: MatSnackBar,
		private entitySelectionService: EntitySelectionService,
		private router: Router,
		private sourceUpdatableService: SourceUpdatableService
	) {}

	ngOnInit() {
		this.selectedBannerSource = this.chainXyService.getSelectedBannerSource();
		if (this.selectedBannerSource) {
			console.log(this.selectedBannerSource);
			this.loadType = 'BANNERSOURCE';
			this.getPGSources(this.loadType);
		} else {
			console.log('no chain found!');
			const answer = confirm('No chain was found, would you like to load all unvalidated ChainXY stores?');
			if (answer) {
				this.loadType = 'GEOGRAPHY';
				this.getPGSources(this.loadType);
			} else {
				this.router.navigate([ 'data-upload/chain-xy/chains' ]);
			}
		}
	}

	getPGSources(type) {
		let retrievingSources = true;

		if (type === 'BANNERSOURCE') {
			this.sourceService
				.getSourcesByBannerSourceId(this.selectedBannerSource.id)
				.pipe(finalize(() => (retrievingSources = false)))
				.subscribe((page: Pageable<StoreSource>) => {
					this.totalStoreSourceRecords = page.totalElements;
					this.records = page.content;
					console.log(this.records);
					this.setCurrentRecord(0);
				});
		} else if (type === 'GEOGRAPHY') {
			this.sourceService
				.getSourcesNotValidated('ChainXY')
				.pipe(finalize(() => (retrievingSources = false)))
				.subscribe((page: Pageable<StoreSource>) => {
					this.totalStoreSourceRecords = page.totalElements;
					this.records = page.content;
					this.setCurrentRecord(0);
				});
		}
	}

	cancelStep2() {
		this.sourceUpdatable = null;
		this.stepper.reset();
		this.stepper.previous();
		this.setChainXyFeature(false);
	}

	private advance(sourceUpdatable: SourceUpdatable) {
		this.sourceUpdatable = sourceUpdatable;
		this.stepper.next();
	}

	noMatch() {
		this.setChainXyFeature(true);
		this.advance(new SourceUpdatable());
	}

	matchShoppingCenter(scId: number) {
		this.isFetching = true;
		this.chainXyService
			.getUpdatableByShoppingCenterId(scId)
			.pipe(finalize(() => (this.isFetching = false)))
			.subscribe((sourceUpdatable) => {
				this.setChainXyFeature(true);
				this.advance(sourceUpdatable);
			});
	}

	matchSite(siteId: number) {
		this.isFetching = true;
		this.chainXyService
			.getUpdatableBySiteId(siteId)
			.pipe(finalize(() => (this.isFetching = false)))
			.subscribe((sourceUpdatable) => this.advance(sourceUpdatable));
	}

	matchStore(storeId: number) {
		this.isFetching = true;
		this.sourceUpdatableService
			.getUpdatableByStoreId(storeId)
			.pipe(finalize(() => (this.isFetching = false)))
			.subscribe((sourceUpdatable) => this.advance(sourceUpdatable));
	}

	nextRecord() {
		this.setChainXyFeature(false);
		this.stepper.reset();
		this.getPGSources(this.loadType);
	}

	setChainXyFeature(draggable: boolean) {
		this.chainXyMapLayer.setChainXyFeature(this.chainXyRecord, draggable);
	}

	siteHover(store, type) {
		if (type === 'enter') {
			this.storeMapLayer.selectEntity(store);
		} else {
			this.storeMapLayer.clearSelection();
		}
	}

	setCurrentRecord(index: number) {
		this.bestMatch = null;
		this.currentRecordIndex = index;

		if (this.records.length > 0) {
			this.currentStoreSource = this.records[index];

			this.isFetching = true;
			this.currentDBResults = [];

			// this.sourceService.getOneById(this.currentStoreSource.id).subscribe((ss) => {
			// console.log(ss);
			console.log(this.currentStoreSource);
			this.chainXyService
				.getFeatureByObjectId(this.currentStoreSource.id)
				.pipe(finalize(() => (this.isFetching = false)))
				.subscribe((record) => {
					console.log(record);
					if (!record) {
						this.ngZone.run(() =>
							this.snackBar.open(`Feature not found with id: ${this.currentStoreSource.id}`)
						);
					} else {
						this.chainXyRecord = record;
						this.mapService.setCenter({
							lat: this.chainXyRecord.Latitude,
							lng: this.chainXyRecord.Longitude
						});
						this.mapService.setZoom(15);

						this.setChainXyFeature(false);
						this.cancelStep2();
					}
				});
			// });
		}
	}

	onMapReady(event) {
		this.chainXyMapLayer = new ChainXyLayer(this.mapService);
		this.chainXyMapLayer.markerDragEnd$.subscribe((draggedMarker: ChainXyMappable) => {
			const coords = this.chainXyMapLayer.getCoordinatesOfMappableMarker(draggedMarker);
			this.sourceUpdatable.longitude = coords.lng;
			this.sourceUpdatable.latitude = coords.lat;
		});
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
			this.currentDBResults = [];
			this.getEntities(bounds);
		});
	}

	getEntities(bounds: { east; north; south; west }): void {
		if (this.mapService.getZoom() > 10) {
			this.mapDataLayer.clearDataPoints();
			this.gettingEntities = true;
			console.log('get entities');
			this.getStoresInBounds()
				.pipe(finalize(() => (this.gettingEntities = false)))
				.subscribe(
					() => console.log('Retrieved Entities'),
					(err) =>
						this.ngZone.run(() =>
							this.errorService.handleServerError(
								`Failed to retrieve entities!`,
								err,
								() => console.log(err),
								() => this.getEntities(bounds)
							)
						)
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

	private getStoresInBounds() {
		return this.storeService.getStoresOfTypeInBounds(this.mapService.getBounds(), this.storeTypes, false).pipe(
			tap((list) => {
				const allMatchingSites = _.uniqBy(
					list.map((store) => {
						store.site['stores'] = [];
						return store.site;
					}),
					'id'
				);

				list.forEach((store) => {
					const siteIdx = allMatchingSites.findIndex((site) => site['id'] === store.site.id);
					allMatchingSites[siteIdx]['stores'].push(store);
				});
				this.gettingEntities = false;
				this.currentDBResults = allMatchingSites;

				if (this.chainXyRecord && this.currentDBResults) {
					const chainXyName = this.chainXyRecord.StoreName;

					this.currentDBResults.forEach((site) => {
						const crGeom = {
							lng: this.chainXyRecord.Longitude,
							lat: this.chainXyRecord.Latitude
						};

						const dbGeom = { lng: site['longitude'], lat: site['latitude'] };
						const dist = MapService.getDistanceBetween(crGeom, dbGeom);
						site['distanceFrom'] = dist * 0.000621371;

						const heading = MapService.getHeading(crGeom, dbGeom);
						site['heading'] = `rotate(${heading}deg)`; // 0 is up, 90 is right, 180 is down, -90 is left

						site['stores'].forEach((store) => {
							const dbName = store['storeName'];
							const score = WordSimilarity.levenshtein(chainXyName, dbName);

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

					this.currentDBResults.sort((a, b) => {
						return a['distanceFrom'] - b['distanceFrom'];
					});

					this.currentDBResults.forEach((site) => {
						site['stores'].sort((a, b) => {
							return a['storeType'] < b['storeType'] ? -1 : a['storeType'] > b['storeType'] ? 1 : 0;
						});
					});
				}

				this.storeMapLayer.setEntities(list);
				this.ngZone.run(() => {});
			})
		);
	}

	refresh() {
		this.isRefreshing = true;
		this.chainXyService.pingRefresh().pipe(finalize(() => (this.isRefreshing = false))).subscribe(
			() => {
				this.getPGSources(this.loadType);
			},
			(err) => {
				this.errorService.handleServerError(
					'Failed to refresh PG records',
					err,
					() => {},
					() => this.refresh()
				);
			}
		);
	}

	// getChainXyRecordStatus(pgRecord) {
	// 	if (chainXyRecord && chainXyRecord.attributes.STATUS) {
	// 		return ' | Status: ' + this.statuses[pgRecord.attributes.STATUS]['pg'];
	// 	}
	// }
}
