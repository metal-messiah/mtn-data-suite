import { Component, NgZone, OnInit } from '@angular/core';
import { StoreSourceService } from '../../core/services/store-source.service';
import { MapService } from '../../core/services/map.service';
import { PlannedGroceryService } from './planned-grocery-service.service';
import { FormBuilder } from '@angular/forms';
import { MapPointLayer } from '../../models/map-point-layer';
import { StoreMappable } from '../../models/store-mappable';
import { PgMappable } from '../../models/pg-mappable';
import { Pageable } from '../../models/pageable';
import { StoreService } from '../../core/services/store.service';
import { SiteService } from '../../core/services/site.service';
import { ErrorService } from '../../core/services/error.service';
import { Coordinates } from '../../models/coordinates';
import { AuthService } from '../../core/services/auth.service';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { SimplifiedSite } from '../../models/simplified/simplified-site';

import { Store } from '../../models/full/store';
import { Site } from '../../models/full/site';
import { ShoppingCenter} from '../../models/full/shopping-center';

import { WordSimilarity } from '../../utils/word-similarity';

import { MatDialog, MatSnackBar } from '@angular/material';

import { EntityMapLayer } from '../../models/entity-map-layer';
import { SiteMappable } from '../../models/site-mappable';

import { debounce, debounceTime, delay, finalize, mergeMap, tap } from 'rxjs/internal/operators';
import { Observable, of, Subscription } from 'rxjs/index';
import { PlannedGroceryLayer } from '../../models/planned-grocery-layer';
import { MapDataLayer } from '../../models/map-data-layer';
import { StoreSource } from '../../models/full/store-source';

enum Actions {
  add_site = 'ADD_SITE',
  match = 'MATCH',
  add_store = 'ADD_STORE'
}


@Component({
  selector: 'mds-planned-grocery',
  templateUrl: './planned-grocery.component.html',
  styleUrls: ['./planned-grocery.component.css'],
  providers: [PlannedGroceryService]
})
export class PlannedGroceryComponent implements OnInit {
  pgMapLayer: PlannedGroceryLayer;
  storeMapLayer: EntityMapLayer<StoreMappable>;
  siteMapLayer: EntityMapLayer<SiteMappable>;
  mapDataLayer: MapDataLayer;

  records: StoreSource[];
  currentRecord: StoreSource;
  currentRecordIndex: number;

  currentRecordData: object;

  currentDBResults: object[];

  fullStoreData: Store;
  fullSiteData: Site;

  storeTypes: string[] = ['ACTIVE', 'FUTURE', 'HISTORICAL'];
  pgStatuses: object = {
    0: 'Built',
    1: 'Under Construction',
    2: 'Proposed',
    3: 'Planned',
    99: 'Dead Deal'
  }

  gettingEntities = false;

  wordSimilarity: WordSimilarity;
  bestMatch: { store: object, score: number, distanceFrom: number };



  allMatchingSites: object[];
  // firstFormGroup: FormGroup;
  // secondFormGroup: FormGroup;

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
  ) {
    this.wordSimilarity = new WordSimilarity()
  }

  ngOnInit() {
    let retrievingSources = true;
    this.sourceService
      .getSourcesNotValidated()
      .pipe(finalize(() => (retrievingSources = false)))
      .subscribe((page: Pageable<StoreSource>) => {
        this.records = page.content;
        this.setCurrentRecord(0);
        // this.currentDBResults = this.sourceService.getDBTable();
      });
  }

  setStepCompleted(step, action, siteID, storeID, stepper) {
    if (step === 1) {
      this.step1Completed = true;
      this.setStepAction(step, action, siteID, storeID, stepper);

    }
    if (step === 2) {
      this.step2Completed = true;
      this.setStepAction(step, action, siteID, storeID, stepper);
    }

  }

  setStepAction(step, action, siteID, storeID, stepper) {
    if (step === 1) {
      this.step1Action = action;
    }
    if (step === 2) {
      this.step2Action = action;
    }
    console.log(step, action, siteID, storeID);


    this.generateForm(step, action, siteID, storeID, stepper);
  }

  generateForm(step, action, siteID, storeID, stepper) {

    // SITE
    // if (siteID) {
    //   // this.isFetching = true;
    //   this.siteService.getOneById(siteID)
    //     // .pipe(finalize(() => ()))
    //     .subscribe(store => {
    //       this.fullStoreData = Object.assign({}, store);
    //       console.log(this.fullStoreData)

    //     }
    // }

    // // STORE
    // if (storeID) {
    //   // this.isFetching = true;
    //   this.storeService.getOneById(storeID)
    //     // .pipe(finalize(() => ()))
    //     .subscribe(store => {
    //       this.fullStoreData = Object.assign({}, store);
    //       console.log(this.fullStoreData)
    //     }
    // }

    stepper.next()
  }

  siteHover(store, type) {

    if (type == 'enter') { this.storeMapLayer.selectEntity(store) }
    else { this.storeMapLayer.clearSelection() }
  }

  setCurrentRecord(index: number) {
    this.bestMatch = null;
    this.currentRecordIndex = index;
    this.currentRecord = this.records[index];

    this.isFetching = true;
    this.currentDBResults = [];

    this.pgService
      .getFeatureByObjectId(this.currentRecord.sourceNativeId)
      .pipe(finalize(() => (this.isFetching = false)))
      .subscribe(record => {
        console.log(record);
        if (
          record == null ||
          record['features'] == null ||
          record['features'].length < 1
        ) {
          // TODO Notify user of failed retrieval
          return;
        }
        this.currentRecordData = record['features'][0];

        const featureMappable = new PgMappable(this.currentRecordData);

        this.mapService.setCenter(featureMappable.getCoordinates());
        this.mapService.setZoom(15);
        this.createNewLocation(featureMappable);


      });
  }

  private getDebounce() {
    return debounce(val => of(true)
      .pipe(delay(1000)));
  }

  onMapReady(event) {
    this.pgMapLayer = new PlannedGroceryLayer(this.mapService.getMap());
    console.log(`Map is ready`);
    this.storeMapLayer = new EntityMapLayer<StoreMappable>(this.mapService.getMap(), (store: SimplifiedStore) => {
      return new StoreMappable(store, this.authService.sessionUser.id, this.mapService.getMap());
    });
    this.siteMapLayer = new EntityMapLayer<SiteMappable>(this.mapService.getMap(), (site: SimplifiedSite) => {
      return new SiteMappable(site, this.authService.sessionUser.id);
    });
    this.mapDataLayer = new MapDataLayer(this.mapService.getMap(), this.authService.sessionUser.id);

    this.mapService.boundsChanged$.pipe(this.getDebounce())
      .subscribe((bounds: { east, north, south, west }) => {
        this.currentDBResults = [];
        this.getEntities(bounds);

      });
  }

  // Called after querying PG for individual record
  createNewLocation(featureMappable: PgMappable): void {
    // Add new location to layer
    this.pgMapLayer.setPgFeature(featureMappable);
  }

  cancelLocationCreation(): void {
    // Remove layer from map
    this.pgMapLayer.removeFromMap();
    // Delete new Location layer
    this.pgMapLayer = null;
  }

  getEntities(bounds: { east, north, south, west }): void {

    if (this.mapService.getZoom() > 10) {
      this.mapDataLayer.clearDataPoints();
      const storeTypes = this.storeTypes;
      this.gettingEntities = true;
      this.getSitesInBounds(bounds)
        // .pipe(finalize(() => this.gettingEntities = false))
        .pipe(mergeMap(() => {
          if (storeTypes.length > 0) {
            return this.getStoresInBounds(bounds);
          } else {
            this.storeMapLayer.setEntities([]);
            return of(null);
          }
        }))
        .subscribe(() => console.log('Retrieved Entities')
          , err => {
            this.ngZone.run(() => {
              this.errorService.handleServerError(`Failed to retrieve entities!`, err,
                () => console.log(err),
                () => this.getEntities(bounds));
            });
          });
    } else if (this.mapService.getZoom() > 7) {
      this.getPointsInBounds(bounds);
      this.storeMapLayer.setEntities([]);
      this.siteMapLayer.setEntities([]);
    } else {
      this.ngZone.run(() => this.snackBar.open('Zoom in for location data', null, {
        duration: 1000,
        verticalPosition: 'top'
      }));
      this.mapDataLayer.clearDataPoints();
      this.storeMapLayer.setEntities([]);
      this.siteMapLayer.setEntities([]);
    }

  }

  private getPointsInBounds(bounds) {
    this.siteService.getSitePointsInBounds(bounds).subscribe((sitePoints: Coordinates[]) => {
      // console.log(sitePoints)
      if (sitePoints.length <= 1000) {
        this.mapDataLayer.setDataPoints(sitePoints);
        this.ngZone.run(() => {
          const message = `Showing ${sitePoints.length} items`;
          this.snackBar.open(message, null, { duration: 2000, verticalPosition: 'top' });
        });
      } else {
        this.ngZone.run(() => {
          const message = `Too many locations, zoom in to see data`;
          this.snackBar.open(message, null, { duration: 2000, verticalPosition: 'top' });
        });
      }
    })
  }

  clearAllMatchingSites() {
    this.allMatchingSites = [];
  }

  private getSitesInBounds(bounds) {
    // Get Sites without stores
    return this.siteService.getSitesWithoutStoresInBounds(bounds).pipe(tap(page => {


      this.siteMapLayer.setEntities(page.content);
    }));
  }

  removeDuplicateSites(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }

  private getStoresInBounds(bounds) {
    return this.storeService
      .getStoresOfTypeInBounds(
        bounds, // this.mapService.getBounds()
        this.storeTypes, // storeTypes: string[] = ['ACTIVE', 'FUTURE', 'HISTORICAL'];
        false
      )
      .pipe(
        tap(page => {

          this.clearAllMatchingSites();
          this.allMatchingSites = page.content.map(store => {
            store.site['stores'] = [];
            return store.site
          })

          this.allMatchingSites = this.removeDuplicateSites(this.allMatchingSites, 'id');

          page.content.forEach(store => {
            const siteIdx = this.allMatchingSites.findIndex(site => site['id'] === store.site.id);
            this.allMatchingSites[siteIdx]['stores'].push(store)
          })
          this.gettingEntities = false;
          this.currentDBResults = this.allMatchingSites;

          if (this.currentRecordData && this.currentDBResults) {
            const pgName = this.currentRecordData['attributes']['NAME'];

            this.currentDBResults.forEach(site => {
              const crGeom = { 'lng': this.currentRecordData['geometry']['x'], 'lat': this.currentRecordData['geometry']['y'] };
              const dbGeom = { 'lng': site['longitude'], 'lat': site['latitude'] };
              console.log(crGeom, dbGeom);
              const dist = this.mapService.getDistanceBetween(
                crGeom,
                dbGeom
              )
              site['distanceFrom'] = dist * 0.000621371;

              const heading = this.mapService.getHeading(
                crGeom,
                dbGeom
              )
              site['heading'] = `rotate(${heading}deg)`; // 0 is up, 90 is right, 180 is down, -90 is left

              site['stores'].forEach(store => {
                const dbName = store['storeName'];
                console.log(`SIMILARITY SCORE: ${pgName} & ${dbName}`);
                const score = this.wordSimilarity.levenshtein(pgName, dbName);


                if (this.bestMatch) {
                  if (
                    this.bestMatch.score >= score && this.bestMatch['distanceFrom'] >= site['distanceFrom']) {
                    this.bestMatch = { store: store, score: score, distanceFrom: site['distanceFrom'] }
                  }
                }
                else {
                  this.bestMatch = { store: store, score: score, distanceFrom: site['distanceFrom'] }
                }
              })


            })
            console.log('BEST MATCH: ', this.bestMatch)

            this.currentDBResults.sort((a, b) => {
              return a['distanceFrom'] - b['distanceFrom']
            })

            this.currentDBResults.forEach(site => {
              site['stores'].sort((a, b) => {
                return a['storeType'] < b['storeType'] ? -1 : a['storeType'] > b['storeType'] ? 1 : 0;
              })
            })

            console.log('currentdb', this.currentDBResults)

          }

          // console.log(this.currentRecordData, this.currentDBResults);

          this.storeMapLayer.setEntities(page.content);
          this.ngZone.run(() => {

            // const message = `Showing ${page.numberOfElements} items of ${page.totalElements}`;
            // this.snackBar.open(message, null, {duration: 1000, verticalPosition: 'top'});
          });
        })
      );
  }
}
