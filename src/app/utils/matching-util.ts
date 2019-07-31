import { StoreSource } from '../models/full/store-source';
import { SiteMarker } from '../models/site-marker';
import { MapService } from '../core/services/map.service';
import { WordSimilarity } from './word-similarity';

export class MatchingUtil {

  static calculateDistancesAndHeadings(storeSource: StoreSource, siteMarkers: SiteMarker[]) {
    const storeSourceCoords = {
      lat: storeSource.storeSourceData.latitude,
      lng: storeSource.storeSourceData.longitude
    };
    siteMarkers.forEach(sm => {
      const dbGeom = {lng: sm.longitude, lat: sm.latitude};
      sm['distanceFrom'] = MapService.getDistanceBetween(storeSourceCoords, dbGeom) * 0.000621371;
      // 0 is up, 90 is right, 180 is down, -90 is left
      sm['heading'] = `rotate(${MapService.getHeading(storeSourceCoords, dbGeom)}deg)`;
    });
    return siteMarkers;
  }

  static getBestMatch(minDistance: number, maxWordSimilarityDiff: number, siteMarkers: SiteMarker[], storeSource: StoreSource) {
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
