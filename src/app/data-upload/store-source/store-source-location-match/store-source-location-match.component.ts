import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AddressUtil } from '../../../utils/address-util';
import { SiteMarker } from '../../../models/site-marker';
import { StoreSource } from '../../../models/full/store-source';
import { StoreMarker } from '../../../models/store-marker';
import { MatchingUtil } from '../../../utils/matching-util';

@Component({
  selector: 'mds-store-source-location-match',
  templateUrl: './store-source-location-match.component.html',
  styleUrls: ['./store-source-location-match.component.css']
})
export class StoreSourceLocationMatchComponent implements OnInit, OnChanges {

  @Input() storeSource: StoreSource;
  @Input() siteMarkers: SiteMarker[];

  @Input() gettingStoreSource = false;

  @Output() onBestMatchFound = new EventEmitter<{ store: StoreMarker; score: number; distanceFrom: number }>();
  @Output() onStoreMatched = new EventEmitter<number>();
  @Output() onNoMatch = new EventEmitter();
  @Output() onCreateNewSite = new EventEmitter();
  @Output() onCreateNewStoreForSite = new EventEmitter<number>();
  @Output() onCreateNewSiteForShoppingCenter = new EventEmitter<number>();

  @Input() minBestMatchDistance = 0.05;
  @Input() maxWordSimilarityDiff = 4;

  showNoMatchButton = false;
  showNewSiteButton = false;
  showNewStoreButton = false;
  showMatchShoppingCenterButton = false;

  bestMatch: { store: StoreMarker; score: number; distanceFrom: number };

  constructor() {
  }

  ngOnInit() {
    this.showNoMatchButton = this.onNoMatch.observers.length > 0;
    this.showNewSiteButton = this.onCreateNewSite.observers.length > 0;
    this.showNewStoreButton = this.onCreateNewStoreForSite.observers.length > 0;
    this.showMatchShoppingCenterButton = this.onCreateNewSiteForShoppingCenter.observers.length > 0;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.siteMarkers || changes.storeSource) && this.siteMarkers && this.storeSource) {
      // If there is source data, set the siteMarkers with distance from source
      if (this.storeSource.storeSourceData) {
        this.siteMarkers = MatchingUtil.calculateDistancesAndHeadings(this.storeSource, this.siteMarkers)
          .sort((a, b) => a['distanceFrom'] - b['distanceFrom']);
      }
      // Sort the stores in each site by type
      this.siteMarkers.forEach(sm => sm.stores.sort((a, b) => a.storeType.localeCompare(b.storeType)));
      // Determine the best match
      this.bestMatch = MatchingUtil.getBestMatch(this.minBestMatchDistance, this.maxWordSimilarityDiff,
        this.siteMarkers, this.storeSource);
      this.onBestMatchFound.emit(this.bestMatch);
    }
  }

  getStoreSourceAddressString() {
    const sd = this.storeSource.storeSourceData;
    if (sd) {
      return AddressUtil.getAddressString(sd.address, sd.city, sd.state, sd.postalCode);
    }
    return null;
  }

  getSiteAddressString(site: SiteMarker) {
    return AddressUtil.getAddressString(site.address, site.city, site.state, null)
  }

  isBestMatch(storeId: number) {
    return this.bestMatch && this.bestMatch.store.id === storeId;
  }

}
