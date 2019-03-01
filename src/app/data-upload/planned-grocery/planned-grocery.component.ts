import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar, MatStepper } from '@angular/material';
import { debounceTime, finalize, tap } from 'rxjs/internal/operators';
import * as _ from 'lodash';

import { StoreSourceService } from '../../core/services/store-source.service';
import { MapService } from '../../core/services/map.service';
import { StoreService } from '../../core/services/store.service';
import { SiteService } from '../../core/services/site.service';
import { ErrorService } from '../../core/services/error.service';
import { AuthService } from '../../core/services/auth.service';

import { WordSimilarity } from '../../utils/word-similarity';

import { StoreMappable } from '../../models/store-mappable';
import { PgMappable } from '../../models/pg-mappable';
import { Pageable } from '../../models/pageable';
import { Coordinates } from '../../models/coordinates';
import { PlannedGroceryLayer } from '../../models/planned-grocery-layer';
import { EntityMapLayer } from '../../models/entity-map-layer';
import { MapDataLayer } from '../../models/map-data-layer';
import { SourceUpdatable } from '../../models/source-updatable';
import { StoreSource } from '../../models/full/store-source';

import { PlannedGroceryService } from './planned-grocery-service.service';
import { StoreMapLayer } from '../../models/store-map-layer';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { SourceUpdatableService } from '../../core/services/source-updatable.service';

@Component({
  selector: 'mds-planned-grocery',
  templateUrl: './planned-grocery.component.html',
  styleUrls: ['./planned-grocery.component.css'],
  providers: [PlannedGroceryService]
})
export class PlannedGroceryComponent implements OnInit {
  PLANNED_GROCERY_SOURCE_NAME = 'Planned Grocery';

  // Mapping
  pgMapLayer: PlannedGroceryLayer;
  storeMapLayer: EntityMapLayer<StoreMappable>;
  mapDataLayer: MapDataLayer;

  // StoreSource to-do list
  records: StoreSource[];
  currentStoreSource: StoreSource;
  currentRecordIndex: number;
  totalStoreSourceRecords: number;

  // Planned Grocery Data
  pgRecord: { attributes; geometry };

  // Database Data (Potential Matches)
  currentDBResults: object[];

  // Working record (used for data editing)
  sourceUpdatable: SourceUpdatable;

  bestMatch: { store: object; score: number; distanceFrom: number };

  // Flags
  gettingEntities = false;
  isFetching = false;
  isRefreshing = false;

  // Reference Values
  storeTypes: string[] = ['ACTIVE', 'FUTURE', 'HISTORICAL'];
  statuses = {
    0: {pg: 'Built', db: 'Open'},
    1: {pg: 'Under Construction', db: 'New Under Construction'},
    2: {pg: 'Proposed', db: 'Proposed'},
    3: {pg: 'Planned', db: 'Planned'},
    99: {pg: 'Dead Deal', db: 'Dead Deal'}
  };

  @ViewChild('stepper') stepper: MatStepper;

  constructor(
    private sourceService: StoreSourceService,
    private mapService: MapService,
    private pgService: PlannedGroceryService,
    private _formBuilder: FormBuilder,
    private ngZone: NgZone,
    private siteService: SiteService,
    private storeService: StoreService,
    private errorService: ErrorService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private entitySelectionService: EntitySelectionService,
    private sourceUpdatableService: SourceUpdatableService
  ) {
  }

  ngOnInit() {
    this.getPGSources();
  }

  getPGSources() {
    let retrievingSources = true;
    this.sourceService
      .getSourcesNotValidated(this.PLANNED_GROCERY_SOURCE_NAME)
      .pipe(finalize(() => (retrievingSources = false)))
      .subscribe((page: Pageable<StoreSource>) => {
        this.totalStoreSourceRecords = page.totalElements;
        this.records = page.content;
        this.setCurrentRecord(0);
      });
  }

  cancelStep2() {
    this.sourceUpdatable = null;
    this.stepper.reset();
    this.stepper.previous();
    this.setPgFeature(false);
  }

  private advance(sourceUpdatable: SourceUpdatable) {
    this.sourceUpdatable = sourceUpdatable;
    this.stepper.next();
  }

  noMatch() {
    this.setPgFeature(true);
    this.advance(new SourceUpdatable());
  }

  matchShoppingCenter(scId: number) {
    this.isFetching = true;
    this.sourceUpdatableService
      .getUpdatableByShoppingCenterId(scId)
      .pipe(finalize(() => (this.isFetching = false)))
      .subscribe((sourceUpdatable) => {
        this.setPgFeature(true);
        this.advance(sourceUpdatable);
      });
  }

  matchSite(siteId: number) {
    this.isFetching = true;
    this.sourceUpdatableService
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
    this.setPgFeature(false);
    this.stepper.reset();
    this.getPGSources();
  }

  setPgFeature(draggable: boolean) {
    this.pgMapLayer.setPgFeature(this.pgRecord, draggable);
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

      this.pgService
        .getFeatureByObjectId(this.currentStoreSource.sourceNativeId)
        .pipe(finalize(() => (this.isFetching = false)))
        .subscribe((record) => {
          if (!record || !record['features'] || record['features'].length < 1) {
            this.ngZone.run(() =>
              this.snackBar.open(`Feature not found with id: ${this.currentStoreSource.sourceNativeId}`)
            );
          } else {
            this.pgRecord = record['features'][0];
            this.mapService.setCenter({lat: this.pgRecord.geometry.y, lng: this.pgRecord.geometry.x});
            this.mapService.setZoom(15);

            this.setPgFeature(false);
            this.cancelStep2();
          }
        });
    }
  }

  onMapReady(event) {
    this.pgMapLayer = new PlannedGroceryLayer(this.mapService);
    this.pgMapLayer.markerDragEnd$.subscribe((draggedMarker: PgMappable) => {
      const coords = this.pgMapLayer.getCoordinatesOfMappableMarker(draggedMarker);
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

        if (this.pgRecord && this.currentDBResults) {
          const pgName = this.pgRecord['attributes']['NAME'];

          this.currentDBResults.forEach((site) => {
            const crGeom = {
              lng: this.pgRecord['geometry']['x'],
              lat: this.pgRecord['geometry']['y']
            };

            const dbGeom = {lng: site['longitude'], lat: site['latitude']};
            const dist = MapService.getDistanceBetween(crGeom, dbGeom);
            site['distanceFrom'] = dist * 0.000621371;

            const heading = MapService.getHeading(crGeom, dbGeom);
            site['heading'] = `rotate(${heading}deg)`; // 0 is up, 90 is right, 180 is down, -90 is left

            site['stores'].forEach((store) => {
              const dbName = store['storeName'];
              const score = WordSimilarity.levenshtein(pgName, dbName);

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
        this.ngZone.run(() => {
        });
      })
    );
  }

  refresh() {
    this.isRefreshing = true;
    this.pgService.pingRefresh().pipe(finalize(() => (this.isRefreshing = false))).subscribe(
      () => {
        this.getPGSources();
      },
      (err) => {
        this.errorService.handleServerError(
          'Failed to refresh PG records',
          err,
          () => {
          },
          () => this.refresh()
        );
      }
    );
  }

  getPgRecordStatus(pgRecord) {
    if (pgRecord && pgRecord.attributes.STATUS) {
      return ' | Status: ' + this.statuses[pgRecord.attributes.STATUS]['pg'];
    }
  }
}
