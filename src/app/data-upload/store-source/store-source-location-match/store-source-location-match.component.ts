import { Component, OnDestroy, OnInit } from '@angular/core';
import { SourceLocationMatchingService } from '../source-location-matching.service';
import { AddressUtil } from '../../../utils/address-util';
import { SiteMarker } from '../../../models/site-marker';
import { DbEntityMarkerService } from '../../../core/services/db-entity-marker.service';
import { EntitySelectionService } from '../../../core/services/entity-selection.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mds-store-source-location-match',
  templateUrl: './store-source-location-match.component.html',
  styleUrls: ['./store-source-location-match.component.css']
})
export class StoreSourceLocationMatchComponent implements OnInit, OnDestroy {

  matching = null;

  showNoMatchButton = false;
  showNewSiteButton = false;
  showNewStoreButton = false;
  showMatchShoppingCenterButton = false;

  selectionListener: Subscription;

  constructor(private lms: SourceLocationMatchingService,
              private selectionService: EntitySelectionService,
              private dbEntityMarkerService: DbEntityMarkerService) {
  }

  ngOnInit() {
    this.showNoMatchButton = this.lms.noMatch$.observers.length > 0;
    this.showNewSiteButton = this.lms.createNewSite$.observers.length > 0;
    this.showNewStoreButton = this.lms.createNewStoreForSite$.observers.length > 0;
    this.showMatchShoppingCenterButton = this.lms.createNewSiteForShoppingCenter$.observers.length > 0;

    this.selectionListener = this.selectionService.singleSelect$.subscribe(selection => this.matchStore(selection.storeId));

    this.dbEntityMarkerService.visibleMarkersChanged$.subscribe(() => this.matching = null);
  }

  ngOnDestroy() {
    this.selectionListener.unsubscribe();
  }

  matchStore(storeId: number) {
    this.matching = storeId;
    this.lms.matchStore(storeId);
  }

  createNewSite() {
    this.lms.createNewSite$.next();
  }

  createNewSiteForShoppingCenter(scId: number) {
    this.lms.createNewSiteForShoppingCenter$.next(scId);
  }

  createNewStoreForSite(siteId: number) {
    this.lms.createNewStoreForSite$.next(siteId);
  }

  setNoMatch() {
    this.lms.noMatch$.next();
  }

  gettingStoreSource() {
    return this.lms.gettingStoreSource;
  }

  getStoreSource() {
    return this.lms.storeSource;
  }

  gettingDbResults() {
    return this.dbEntityMarkerService.gettingLocations;
  }

  get siteMarkers() {
    return this.lms.siteMarkers;
  }

  getStoreSourceAddressString() {
    const ss = this.lms.storeSource;
    const sd = ss.storeSourceData;
    if (sd) {
      return AddressUtil.getAddressString(sd.address, sd.city, sd.state, sd.postalCode);
    }
    return null;
  }

  getSiteAddressString(site: SiteMarker) {
    return AddressUtil.getAddressString(site.address, site.city, site.state, null)
  }

  isBestMatch(storeId: number) {
    return this.lms.bestMatch && this.lms.bestMatch.store.id === storeId;
  }

}
