import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
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
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { PlannedGroceryLayer } from '../../models/planned-grocery-layer';
import { EntityMapLayer } from '../../models/entity-map-layer';
import { MapDataLayer } from '../../models/map-data-layer';
import { PlannedGroceryUpdatable } from '../../models/planned-grocery-updatable';
import { StoreSource } from '../../models/full/store-source';

import { PlannedGroceryService } from './planned-grocery-service.service';

@Component({
  selector: 'mds-planned-grocery',
  templateUrl: './planned-grocery.component.html',
  styleUrls: ['./planned-grocery.component.css'],
  providers: [PlannedGroceryService]
})
export class PlannedGroceryComponent implements OnInit {

  // Mapping
  pgMapLayer: PlannedGroceryLayer;
  storeMapLayer: EntityMapLayer<StoreMappable>;
  mapDataLayer: MapDataLayer;

  // StoreSource to-do list
  records: StoreSource[];
  currentRecord: StoreSource;
  currentRecordIndex: number;
  totalStoreSourceRecords: number;

  // Planned Grocery Data
  currentPGRecordData: any;

  // Database Data (Potential Matches)
  currentDBResults: object[];

  // Working record (used for data editing)
  plannedGroceryUpdatable: PlannedGroceryUpdatable;

  dateOpened: Date;

  storeTypes: string[] = ['ACTIVE', 'FUTURE', 'HISTORICAL'];
  statuses: object = {
    0: {pg: 'Built', db: 'Open'},
    1: {pg: 'Under Construction', db: 'New Under Construction'},
    2: {pg: 'Proposed', db: 'Proposed'},
    3: {pg: 'Planned', db: 'Planned'},
    99: {pg: 'Dead Deal', db: 'Dead Deal'}
  };
  storeStatusOptions = ['Closed', 'Dead Deal', 'New Under Construction', 'Open', 'Planned', 'Proposed', 'Remodel',
    'Rumored', 'Strong Rumor', 'Temporarily Closed'];

  statusSelection;

  bestMatch: { store: object; score: number; distanceFrom: number };

  // Flags
  gettingEntities = false;
  isFetching = false;

  step1Completed = false;
  step1Action: string;

  step2Completed = false;
  step2Action: string;

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
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.getPGSources();
  }

  getPGSources() {
    console.log('GETTING PG SOURCES!');
    let retrievingSources = true;
    this.sourceService
      .getSourcesNotValidated()
      .pipe(finalize(() => (retrievingSources = false)))
      .subscribe((page: Pageable<StoreSource>) => {
        this.totalStoreSourceRecords = page.totalElements;
        this.records = page.content;
        this.setCurrentRecord(0);
        // this.currentDBResults = this.sourceService.getDBTable();
      });
  }

  setFullStoreDataProperty(property, val) {
    console.log(property, val);
    if (property === 'STATUS' && this.currentPGRecordData) {
      const s = {id: null, status: val, statusStartDate: new Date(this.currentPGRecordData['attributes'].EditDate)};
      this.plannedGroceryUpdatable['storeStatuses'].push(s)
    } else {
      this.plannedGroceryUpdatable[property] = val;
    }
    console.log(this.plannedGroceryUpdatable)
  }

  setStepCompleted(step, completed, action, siteID, storeID, scID, stepper) {
    if (step === 1) {
      this.step1Completed = completed;
      if (completed) {
        this.setStepAction(step, action, siteID, storeID, scID, stepper);
      } else {
        this.setPgFeature(false);
      }
    }
    if (step === 2) {
      this.step1Completed = false;

      this.plannedGroceryUpdatable.storeSource = this.currentRecord;
      this.pgService.submitUpdate(this.plannedGroceryUpdatable).subscribe(() => {
          this.setPgFeature(false);
          stepper.reset();
          this.getPGSources();
        }, err => this.ngZone.run(() => this.errorService.handleServerError(
        `Failed to update from PG record!`, err,
        () => console.log(err)))
      );

    }
    console.log('step 1 completed?', this.step1Completed);
  }

  setStepAction(step, action, siteID, storeID, scID, stepper) {
    if (step === 1) {
      this.step1Action = action;
    }
    if (step === 2) {
      this.step2Action = action;
    }
    console.log(step, action, siteID, storeID, scID);

    this.generateForm(step, action, siteID, storeID, scID, stepper);
  }

  setPgFeature(draggable) {
    const featureMappable = new PgMappable(this.currentPGRecordData);
    this.pgMapLayer.setPgFeature(featureMappable, draggable);
  }

  generateForm(step, action, siteID, storeID, scID, stepper) {

    this.statusSelection = this.statuses[this.currentPGRecordData['attributes'].STATUS]['db'];
    // MATCH STORE
    if (action === 'MATCH' && storeID) {
      // this.isFetching = true;
      console.log('GET UPDATABLE');
      this.pgService.getUpdatableByStoreId(storeID)
      // .pipe(finalize(() => ()))
        .subscribe(updatable => {
          this.plannedGroceryUpdatable = updatable;
          if (updatable.storeStatuses && updatable.storeStatuses.length > 0) {
            this.statusSelection = _.maxBy(updatable.storeStatuses, 'statusStartDate').status;
          }
          this.setDateOpened();
          console.log(this.plannedGroceryUpdatable);
          stepper.next();
        });
    } else if (action === 'ADD_STORE' && siteID) {
      this.isFetching = true;
      this.pgService.getUpdatableBySiteId(siteID)
        .pipe(finalize(() => this.isFetching = false))
        .subscribe(updatable => {
          this.plannedGroceryUpdatable = updatable;

          this.setDateOpened();
          console.log(this.plannedGroceryUpdatable);
          stepper.next();
        });
    } else if (action === 'ADD_SISTER' && scID) {
      this.isFetching = true;
      this.pgService
        .getUpdatableByShoppingCenterId(scID)
        .pipe(finalize(() => this.isFetching = false))
        .subscribe(updatable => {
          this.setPgFeature(true);

          this.plannedGroceryUpdatable = this.pgService.updatePGUpdatableFromPGRecord(updatable, this.currentPGRecordData);

          this.setDateOpened();

          console.log(this.plannedGroceryUpdatable);

          stepper.next();
        });
    } else if (action === 'ADD_SITE') {
      this.setPgFeature(true);
      this.plannedGroceryUpdatable = this.pgService.updatePGUpdatableFromPGRecord(new PlannedGroceryUpdatable(), this.currentPGRecordData);
      this.setDateOpened();
      setTimeout(() => stepper.next(), 500);
    }
  }

  setDateOpened() {
    this.dateOpened = this.plannedGroceryUpdatable.dateOpened ?
      new Date(this.plannedGroceryUpdatable.dateOpened).toLocaleDateString() :
      this.currentPGRecordData.attributes.OPENDATEAPPROX ?
        this.currentPGRecordData.attributes.OPENDATEAPPROX : null;
    console.log(this.dateOpened)
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
    this.currentRecord = this.records[index];

    this.isFetching = true;
    this.currentDBResults = [];

    this.pgService.getFeatureByObjectId(this.currentRecord.sourceNativeId)
      .pipe(finalize(() => (this.isFetching = false)))
      .subscribe(record => {
        if (!record || !record['features'] || record['features'].length < 1) {
          this.ngZone.run(() => this.snackBar
            .open(`Feature not found with id: ${this.currentRecord.sourceNativeId}`)
          )
        } else {
          this.currentPGRecordData = record['features'][0];

          const featureMappable = new PgMappable(this.currentPGRecordData);

          this.mapService.setCenter(featureMappable.getCoordinates());
          this.mapService.setZoom(15);

          this.setPgFeature(false);
        }
      });
  }

  onMapReady(event) {
    this.pgMapLayer = new PlannedGroceryLayer(this.mapService.getMap());
    this.pgMapLayer.markerDragEnd$.subscribe((draggedMarker: PgMappable) => {
      const coords = this.pgMapLayer.getCoordinatesOfMappableMarker(draggedMarker);
      this.plannedGroceryUpdatable.longitude = coords.lng;
      this.plannedGroceryUpdatable.latitude = coords.lat;
    });
    console.log(`Map is ready`);
    this.storeMapLayer = new EntityMapLayer<StoreMappable>(
      this.mapService.getMap(),
      (store: SimplifiedStore) => {
        return new StoreMappable(store, this.authService.sessionUser.id, null);
      }
    );
    this.mapDataLayer = new MapDataLayer(
      this.mapService.getMap(),
      this.authService.sessionUser.id
    );

    this.mapService.boundsChanged$
      .pipe(debounceTime(1000))
      .subscribe((bounds: { east; north; south; west }) => {
        this.currentDBResults = [];
        this.getEntities(bounds);
      });
  }

  getEntities(bounds: { east; north; south; west }): void {
    if (this.mapService.getZoom() > 10) {
      this.mapDataLayer.clearDataPoints();
      this.gettingEntities = true;
      this.getStoresInBounds()
        .pipe(finalize(() => this.gettingEntities = false))
        .subscribe(
          () => console.log('Retrieved Entities'),
          err => this.ngZone.run(() => this.errorService.handleServerError(`Failed to retrieve entities!`, err,
            () => console.log(err),
            () => this.getEntities(bounds))
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
    this.siteService
      .getSitePointsInBounds(bounds)
      .subscribe((sitePoints: Coordinates[]) => {
        // console.log(sitePoints)
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
    return this.storeService
      .getStoresOfTypeInBounds(this.mapService.getBounds(), this.storeTypes, false)
      .pipe(tap(page => {
          const allMatchingSites = _.uniqBy(page.content.map(store => {
            store.site['stores'] = [];
            return store.site;
          }), 'id');

          page.content.forEach(store => {
            const siteIdx = allMatchingSites.findIndex(site => site['id'] === store.site.id);
            allMatchingSites[siteIdx]['stores'].push(store);
          });
          this.gettingEntities = false;
          this.currentDBResults = allMatchingSites;

          if (this.currentPGRecordData && this.currentDBResults) {
            const pgName = this.currentPGRecordData['attributes']['NAME'];

            this.currentDBResults.forEach(site => {
              const crGeom = {
                lng: this.currentPGRecordData['geometry']['x'],
                lat: this.currentPGRecordData['geometry']['y']
              };

              const dbGeom = {lng: site['longitude'], lat: site['latitude']};
              console.log(crGeom, dbGeom);
              const dist = this.mapService.getDistanceBetween(crGeom, dbGeom);
              site['distanceFrom'] = dist * 0.000621371;

              const heading = this.mapService.getHeading(crGeom, dbGeom);
              site['heading'] = `rotate(${heading}deg)`; // 0 is up, 90 is right, 180 is down, -90 is left

              site['stores'].forEach(store => {
                const dbName = store['storeName'];
                console.log(`SIMILARITY SCORE: ${pgName} & ${dbName}`);
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
            console.log('BEST MATCH: ', this.bestMatch);

            this.currentDBResults.sort((a, b) => {
              return a['distanceFrom'] - b['distanceFrom'];
            });

            this.currentDBResults.forEach(site => {
              site['stores'].sort((a, b) => {
                return a['storeType'] < b['storeType']
                  ? -1
                  : a['storeType'] > b['storeType']
                    ? 1
                    : 0;
              });
            });

            console.log('currentdb', this.currentDBResults);
          }

          console.log('setting content');

          this.storeMapLayer.setEntities(page.content);
          this.ngZone.run(() => {
          });
        })
      );
  }
}
