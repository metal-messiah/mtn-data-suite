import { Component, OnInit, ViewChild } from '@angular/core';
import { StoreMarker } from 'app/models/store-marker';
import { SortDirection, SortType, StoreSidenavService } from '../store-sidenav/store-sidenav.service';
import { SiteMarker } from 'app/models/site-marker';
import { SiteService } from 'app/core/services/site.service';
import { DbEntityMarkerService } from '../../core/services/db-entity-marker.service';
import { MapService } from '../../core/services/map.service';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'mds-stores-list',
  templateUrl: './stores-list.component.html',
  styleUrls: ['./stores-list.component.css']
})
export class StoresListComponent implements OnInit {

  @ViewChild('virtualScroll', {static: false}) virtualScroll: CdkVirtualScrollViewport;

  constructor(
    private storeSidenavService: StoreSidenavService,
    private dbEntityMarkerService: DbEntityMarkerService,
    private mapService: MapService,
    private selectionService: EntitySelectionService,
    private siteService: SiteService
  ) {
  }

  ngOnInit() {
    this.storeSidenavService.updateItems(this.dbEntityMarkerService.getVisibleSiteMarkers());
    this.dbEntityMarkerService.visibleMarkersChanged$.subscribe(() => {
      this.storeSidenavService.updateItems(this.dbEntityMarkerService.getVisibleSiteMarkers())
    });

    this.selectionService.singleSelect$.subscribe(selection => this.scrollToStore(selection.storeId));
  }

  siteIsSelected(siteId: number) {
    return this.selectionService.siteIds.has(siteId);
  }

  storeIsSelected(storeId: number) {
    return this.selectionService.storeIds.has(storeId);
  }

  get sortType() {
    return this.storeSidenavService.sortType;
  }

  get sortDirection() {
    return this.storeSidenavService.sortDirection;
  }

  get fetching() {
    return this.storeSidenavService.fetching;
  }

  get sortGroups() {
    return this.storeSidenavService.sortGroups;
  }

  setSortOptions(sortType?: SortType, sortDirection?: SortDirection) {
    this.storeSidenavService.setSortOptions(sortType, sortDirection)
  }

  getStoreSubtext(site: SiteMarker, store: StoreMarker) {
    return this.storeSidenavService.getStoreSubtext(site, store);
  }

  getFormattedIntersection(site: SiteMarker) {
    return this.siteService.getFormattedIntersection(site);
  }

  getLogoPath(fileName: string) {
    return `https://res.cloudinary.com/mtn-retail-advisors/image/upload/c_limit,h_20/${fileName}`;
  }

  getAddressLabel(siteMarker: SiteMarker) {
    let address = siteMarker.address;
    if (address) {
      address += ', ';
    }
    return address + this.siteService.getFormattedPrincipality(siteMarker);
  }

  // Causes selectionSet$ to emit - which will then affect the state
  select(siteMarker: SiteMarker, storeMarker?: StoreMarker) {
    // If store is provided, select it, otherwise select the site
    if (storeMarker) {
      this.selectionService.singleSelect({siteId: siteMarker.id, storeId: storeMarker.id});
    } else if (siteMarker) {
      this.selectionService.singleSelect({siteId: siteMarker.id, storeId: null})
    }
  }

  showOnMap(site: SiteMarker) {
    this.mapService.setCenter({
      lat: site.latitude,
      lng: site.longitude
    });
  }

  get siteMarkers() {
    return this.storeSidenavService.siteMarkers;
  }

  private scrollToStore(storeId: number) {
    const index = this.siteMarkers.findIndex(sm => sm.stores.find(st => st.id === storeId) !== null);
    this.virtualScroll.scrollToIndex(index);
  }
}
