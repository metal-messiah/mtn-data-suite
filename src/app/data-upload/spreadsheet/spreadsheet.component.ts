import { Component, NgZone, OnInit } from '@angular/core';
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

import { MatSnackBar } from '@angular/material';

import { EntityMapLayer } from '../../models/entity-map-layer';

import { debounceTime, finalize, tap } from 'rxjs/internal/operators';
import { MapDataLayer } from '../../models/map-data-layer';
import { SpreadsheetLayer } from '../../models/spreadsheet-layer';
import { SpreadsheetRecord } from '../../models/spreadsheet-record';
import { SpreadsheetService } from './spreadsheet.service';

import * as _ from 'lodash';
import { StoreMapLayer } from '../../models/store-map-layer';
import { EntitySelectionService } from '../../core/services/entity-selection.service';

@Component({
  selector: 'mds-spreadsheet',
  templateUrl: './spreadsheet.component.html',
  styleUrls: ['./spreadsheet.component.css'],
  providers: [SpreadsheetService]
})
export class SpreadsheetComponent implements OnInit {
  spreadsheetLayer: SpreadsheetLayer;
  storeMapLayer: EntityMapLayer<StoreMappable>;
  mapDataLayer: MapDataLayer;

  records: SpreadsheetRecord[];
  currentRecord: SpreadsheetRecord;
  currentRecordIndex: number;

  currentDBSiteResults: SimplifiedSite[];

  readonly storeTypes: string[] = ['ACTIVE', 'FUTURE', 'HISTORICAL'];

  gettingEntities = false;

  wordSimilarity: WordSimilarity;
  bestMatch: { store: object, score: number, distanceFrom: number };

  isFetching = false;
  isAutoMatching = false;

  constructor(
    private mapService: MapService,
    private spreadsheetService: SpreadsheetService,
    private ngZone: NgZone,
    private siteService: SiteService,
    private storeService: StoreService,
    private errorService: ErrorService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private entitySelectionService: EntitySelectionService
  ) {
    this.wordSimilarity = new WordSimilarity()
  }

  ngOnInit() {
    let retrievingSources = true;
    this.spreadsheetService.loadSpreadsheet()
      .pipe(finalize(() => (retrievingSources = false)))
      .subscribe((records: SpreadsheetRecord[]) => {
        this.records = records;
      });
  }

  siteHover(store, type) {
    if (type === 'enter') {
      this.storeMapLayer.selectEntity(store)
    } else {
      this.storeMapLayer.clearSelection()
    }
  }

  setCurrentSpreadsheetRecord(index: number) {
    if (index < this.records.length) {
      this.bestMatch = null;
      this.currentRecordIndex = index;
      this.currentRecord = this.records[index];
      this.currentDBSiteResults = [];
      this.spreadsheetLayer.setRecord(this.currentRecord);
    } else {
      this.isAutoMatching = false;
      console.warn('End of Records');
    }
  }

  onMapReady() {
    this.spreadsheetLayer = new SpreadsheetLayer(this.mapService);
    console.log(`Map is ready`);
    this.storeMapLayer = new StoreMapLayer(this.mapService, this.authService, this.entitySelectionService.storeIds, () => null);
    this.mapDataLayer = new MapDataLayer(this.mapService.getMap(), this.authService.sessionUser.id, this.entitySelectionService.siteIds);

    this.mapService.boundsChanged$.pipe(debounceTime(1000))
      .subscribe((bounds: { east, north, south, west }) => {
        this.currentDBSiteResults = [];
        this.getEntities(bounds);
      });

    this.setCurrentSpreadsheetRecord(0);
  }

  getEntities(bounds: { east, north, south, west }): void {
    if (this.mapService.getZoom() > 10) {
      this.mapDataLayer.clearDataPoints();
      this.gettingEntities = true;
      this.getStoresInBounds(bounds)
        .pipe(finalize(() => this.gettingEntities = false))
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
    } else {
      this.ngZone.run(() => this.snackBar.open('Zoom in for location data', null, {
        duration: 1000,
        verticalPosition: 'top'
      }));
      this.mapDataLayer.clearDataPoints();
      this.storeMapLayer.setEntities([]);
    }
  }

  private getPointsInBounds(bounds) {
    this.siteService.getSitePointsInBounds(bounds).subscribe((sitePoints: Coordinates[]) => {
      // console.log(sitePoints)
      if (sitePoints.length <= 1000) {
        this.mapDataLayer.setDataPoints(sitePoints);
        this.ngZone.run(() => {
          const message = `Showing ${sitePoints.length} items`;
          this.snackBar.open(message, null, {duration: 2000, verticalPosition: 'top'});
        });
      } else {
        this.ngZone.run(() => {
          const message = `Too many locations, zoom in to see data`;
          this.snackBar.open(message, null, {duration: 2000, verticalPosition: 'top'});
        });
      }
    })
  }

  private getStoresInBounds(bounds) {
    return this.storeService.getStoresOfTypeInBounds(bounds, this.storeTypes, false)
      .pipe(
        tap((page: Pageable<SimplifiedStore>) => {
          const allMatchingSites = _.uniqBy(page.content.map(store => {
            store.site['stores'] = []; // Used to group stores by site
            return store.site;
          }), 'id');

          page.content.forEach(store => {
            const siteIdx = allMatchingSites.findIndex(site => site['id'] === store.site.id);
            allMatchingSites[siteIdx]['stores'].push(store)
          });
          this.gettingEntities = false;
          this.currentDBSiteResults = allMatchingSites;

          if (this.currentRecord && this.currentDBSiteResults) {
            const recordName = this.currentRecord.displayName;

            this.currentDBSiteResults.forEach((site: SimplifiedSite) => {
              const crGeom = this.currentRecord.coordinates;
              const dbGeom = {lng: site.longitude, lat: site.latitude};
              console.log(crGeom, dbGeom);
              const dist = MapService.getDistanceBetween(
                crGeom,
                dbGeom
              );
              site['distanceFrom'] = dist * 0.000621371;

              const heading = MapService.getHeading(
                crGeom,
                dbGeom
              );
              site['heading'] = `rotate(${heading}deg)`; // 0 is up, 90 is right, 180 is down, -90 is left

              site['stores'].forEach(store => {
                const dbName = store['storeName'];
                console.log(`SIMILARITY SCORE: ${recordName} & ${dbName}`);
                const score = WordSimilarity.levenshtein(recordName, dbName);


                if (this.bestMatch) {
                  if (this.bestMatch.score >= score && this.bestMatch['distanceFrom'] >= site['distanceFrom']) {
                    this.bestMatch = {store: store, score: score, distanceFrom: site['distanceFrom']}
                  }
                } else {
                  this.bestMatch = {store: store, score: score, distanceFrom: site['distanceFrom']}
                }
              });
            });

            if (this.bestMatch && this.bestMatch.score <= 4 && this.bestMatch.distanceFrom < 0.1) {
              this.currentRecord.matchedStore = this.bestMatch.store as SimplifiedStore;
              console.log('MATCHED');
            } else {

              console.log('NO MATCH: ', this.bestMatch);

              this.currentDBSiteResults.sort((a, b) => {
                return a['distanceFrom'] - b['distanceFrom']
              });

              this.currentDBSiteResults.forEach(site => {
                site['stores'].sort((a, b) => {
                  return a['storeType'] < b['storeType'] ? -1 : a['storeType'] > b['storeType'] ? 1 : 0;
                })
              });

              this.ngZone.run(() => {
                this.storeMapLayer.setEntities(page.content);
              });

              console.log('currentdb', this.currentDBSiteResults)
            }

            if (this.isAutoMatching) {
              this.ngZone.run(() => {
                this.setCurrentSpreadsheetRecord(this.currentRecordIndex + 1);
              });
            }

          }
        })
      );
  }

  private convertToCSV(list: SpreadsheetRecord[]): string {
    if (list.length > 0) {
      let content = '';
      content += 'unique_id,store_id\r\n';
      list.forEach(item => {
        const matchId = item.matchedStore ? item.matchedStore.id : (item.noMatch ? 'NO MATCH' : '');
        content += `${item.uniqueId},${matchId}\r\n`;
      });

      return content;
    } else {
      return null;
    }
  }

  downloadMatches() {
    console.log(this.convertToCSV(this.records));
    // var csvData = this.ConvertToCSV(this.filteredReviews);
    // var blob = new Blob([csvData], { type: 'text/csv' });
    // var url = window.URL.createObjectURL(blob);
    //
    // if(navigator.msSaveOrOpenBlob) {
    //   navigator.msSaveBlob(blob, filename);
    // } else {
    //   var a = document.createElement("a");
    //   a.href = url;
    //   a.download = 'ETPHoldReview.csv';
    //   document.body.appendChild(a);
    //   a.click();
    //   document.body.removeChild(a);
    // }
    // window.URL.revokeObjectURL(url);
  }
}
