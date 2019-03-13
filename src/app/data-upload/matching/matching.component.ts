import { Component, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { debounceTime, finalize, tap } from 'rxjs/operators';
import * as _ from 'lodash';

import { PlannedGroceryLayer } from '../../models/planned-grocery-layer';
import { EntityMapLayer } from '../../models/entity-map-layer';
import { StoreMappable } from '../../models/store-mappable';
import { StoreMapLayer } from '../../models/store-map-layer';

import { MapService } from '../../core/services/map.service';
import { StoreService } from '../../core/services/store.service';
import { ErrorService } from '../../core/services/error.service';
import { AuthService } from '../../core/services/auth.service';
import { EntitySelectionService } from '../../core/services/entity-selection.service';

import { WordSimilarity } from '../../utils/word-similarity';

@Component({
  selector: 'mds-matching',
  templateUrl: './matching.component.html',
  styleUrls: ['./matching.component.css']
})
export class MatchingComponent {

  // Mapping
  recordMapLayer: PlannedGroceryLayer;
  storeMapLayer: EntityMapLayer<StoreMappable>;

  // StoreSource to-do list
  records: {uniqueId: any, latitude: number, longitude: number, storeName: string, storeId: number}[];
  currentRecord: {uniqueId: any, latitude: number, longitude: number, storeName: string, storeId: number};

  // Database Data (Potential Matches)
  currentDBResults: object[];

  bestMatch: { store: object; score: number; distanceFrom: number };

  // Flags
  gettingEntities = false;
  isFetching = false;

  // Reference Values
  storeTypes: string[] = ['ACTIVE', 'FUTURE', 'HISTORICAL'];

  constructor(
    private mapService: MapService,
    private _formBuilder: FormBuilder,
    private ngZone: NgZone,
    private storeService: StoreService,
    private errorService: ErrorService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private entitySelectionService: EntitySelectionService,
  ) {
  }

  noMatch() {
    this.currentRecord.storeId = 0;
    this.nextRecord();
  }

  matchStore(storeId: number) {
    this.currentRecord.storeId = storeId;
    this.nextRecord();
  }

  nextRecord() {
    const index = this.records.indexOf(this.currentRecord);
    if (index + 1 < this.records.length) {
      this.currentRecord = this.records[index + 1];
    }
  }

  siteHover(store, type) {
    if (type === 'enter') {
      this.storeMapLayer.selectEntity(store);
    } else {
      this.storeMapLayer.clearSelection();
    }
  }

  setCurrentRecord(record: any) {
    this.bestMatch = null;
    this.currentRecord = record;

    if (this.records.length > 0) {
      this.isFetching = true;
      this.currentDBResults = [];

      this.mapService.setCenter({lat: record.latitude, lng: record.longitude});
      this.mapService.setZoom(15);


      const feature = {
        attributes: {
          OBJECTID: this.currentRecord.uniqueId
        },
        geometry: {
          x: this.currentRecord.longitude,
          y: this.currentRecord.latitude
        }
      };
      this.recordMapLayer.setPgFeature(feature, false);
    }
  }

  onMapReady(event) {
    this.recordMapLayer = new PlannedGroceryLayer(this.mapService);
    this.storeMapLayer = new StoreMapLayer(
      this.mapService,
      this.authService,
      this.entitySelectionService.storeIds,
      () => null
    );

    this.mapService.boundsChanged$.pipe(debounceTime(1000)).subscribe((bounds: { east; north; south; west }) => {
      this.currentDBResults = [];
      this.getEntities(bounds);
    });
  }

  getEntities(bounds: { east; north; south; west }): void {
    if (this.mapService.getZoom() > 10) {
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
    } else {
      this.ngZone.run(() =>
        this.snackBar.open('Zoom in for location data', null, {
          duration: 1000,
          verticalPosition: 'top'
        })
      );
      this.storeMapLayer.setEntities([]);
    }
  }

  private getStoresInBounds() {
    this.gettingEntities = true;
    return this.storeService.getStoresOfTypeInBounds(this.mapService.getBounds(), this.storeTypes, false)
      .pipe(finalize(() => this.gettingEntities = false))
      .pipe(
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
        this.currentDBResults = allMatchingSites;

        if (this.currentRecord && this.currentDBResults) {
          this.currentDBResults.forEach((site) => {
            const crGeom = {
              lng: this.currentRecord.longitude,
              lat: this.currentRecord.latitude
            };

            const dbGeom = {lng: site['longitude'], lat: site['latitude']};
            const dist = MapService.getDistanceBetween(crGeom, dbGeom);
            site['distanceFrom'] = dist * 0.000621371;

            const heading = MapService.getHeading(crGeom, dbGeom);
            site['heading'] = `rotate(${heading}deg)`; // 0 is up, 90 is right, 180 is down, -90 is left

            site['stores'].forEach((store) => {
              const dbName = store['storeName'];
              const score = WordSimilarity.levenshtein(this.currentRecord.storeName, dbName);

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

}
