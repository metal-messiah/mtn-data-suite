import { Injectable } from '@angular/core';
import { StoreSource } from '../../models/full/store-source';
import { of, Subject } from 'rxjs';
import { SiteMarker } from '../../models/site-marker';
import { MapService } from '../../core/services/map.service';
import { WordSimilarity } from '../../utils/word-similarity';
import { StoreMarker } from '../../models/store-marker';
import { StoreSourceService } from '../../core/services/store-source.service';
import { finalize, tap } from 'rxjs/operators';

@Injectable()
export class SourceLocationMatchingService {

  gettingStoreSource = false;

  noMatch$ = new Subject<void>();
  createNewSite$ = new Subject<void>();
  matchStore$ = new Subject<number>();
  createNewStoreForSite$ = new Subject<number>();
  createNewSiteForShoppingCenter$ = new Subject<number>();

  storeSource: StoreSource;
  _siteMarkers: SiteMarker[];
  bestMatch: { store: StoreMarker; score: number; distanceFrom: number };

  nextStoreSource: StoreSource;

  constructor(private storeSourceService: StoreSourceService) {
  }

  getStoreSource(storeSourceId: number) {
    if (this.nextStoreSource && this.nextStoreSource.id === storeSourceId) {
      this.storeSource = this.nextStoreSource;
      return of(this.nextStoreSource);
    }

    this.gettingStoreSource = true;
    return this.storeSourceService.getOneById(storeSourceId)
      .pipe(finalize(() => (this.gettingStoreSource = false)))
      .pipe(tap((storeSource: StoreSource) => this.storeSource = storeSource));
  }

  fetchNextStoreSource(storeSourceId: number) {
    return this.storeSourceService.getOneById(storeSourceId)
      .subscribe(storeSource => this.nextStoreSource = storeSource);
  }

  setStoreSource(storeSource: StoreSource) {
    this.storeSource = storeSource;
  }

  matchStore(storeId: number) {
    this.matchStore$.next(storeId);
  }

  get siteMarkers() {
    return this._siteMarkers;
  }

  setSiteMarkers(siteMarkers: SiteMarker[], minDistance: number = 0.05, maxWordSimilarityDiff: number = 4) {
    if (this.storeSource.storeSourceData) {
      this._siteMarkers = this.calculateDistancesAndHeadings(siteMarkers)
        .sort((a, b) => a['distanceFrom'] - b['distanceFrom']);
    } else {
      this._siteMarkers = siteMarkers;
    }
    this._siteMarkers.forEach(sm => sm.stores.sort((a, b) => a.storeType.localeCompare(b.storeType)));
    this.bestMatch = this.getBestMatch(minDistance, maxWordSimilarityDiff, siteMarkers, this.storeSource);
  }

  private calculateDistancesAndHeadings(siteMarkers: SiteMarker[]) {
    const storeSourceCoords = {
      lat: this.storeSource.storeSourceData.latitude,
      lng: this.storeSource.storeSourceData.longitude
    };
    siteMarkers.forEach(sm => {
      const dbGeom = {lng: sm.longitude, lat: sm.latitude};
      sm['distanceFrom'] = MapService.getDistanceBetween(storeSourceCoords, dbGeom) * 0.000621371;
      // 0 is up, 90 is right, 180 is down, -90 is left
      sm['heading'] = `rotate(${MapService.getHeading(storeSourceCoords, dbGeom)}deg)`;
    });
    return siteMarkers;
  }

  private getBestMatch(minDistance: number, maxWordSimilarityDiff: number, siteMarkers: SiteMarker[], storeSource: StoreSource) {
    let bestMatch = null;
    if (storeSource && siteMarkers) {
      // Calculate distance, heading, and word similarity
      siteMarkers.forEach(sm => {
        sm.stores.forEach(stm => {
          const wordSimilarityDiff = WordSimilarity.levenshtein(storeSource.sourceStoreName, stm.storeName);

          // If there is already a best match
          if (bestMatch) {
            // If this store is a better match
            if (bestMatch.score >= wordSimilarityDiff && bestMatch.distanceFrom >= sm['distanceFrom']) {
              bestMatch = {store: stm, score: wordSimilarityDiff, distanceFrom: sm['distanceFrom']};
            }
          } else if (sm['distanceFrom'] < minDistance && wordSimilarityDiff < maxWordSimilarityDiff) {
            // Min requirements for a best match
            bestMatch = {store: stm, score: wordSimilarityDiff, distanceFrom: sm['distanceFrom']};
          }
        });
      });
    }
    return bestMatch;
  }
}
