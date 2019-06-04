import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { StoreMarker } from 'app/models/store-marker';
import { StoreSidenavService } from '../store-sidenav/store-sidenav.service';
import { SiteMarker } from 'app/models/site-marker';
import { SiteService } from 'app/core/services/site.service';
import { DbEntityMarkerService } from '../../core/services/db-entity-marker.service';
import { MapService } from '../../core/services/map.service';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { StoreList } from '../../models/full/store-list';
import { ListManagerService } from '../list-manager/list-manager.service';
import { StoreListService } from '../../core/services/store-list.service';
import { SimplifiedStore } from '../../models/simplified/simplified-store';

@Component({
  selector: 'mds-stores-list',
  templateUrl: './stores-list.component.html',
  styleUrls: ['./stores-list.component.css']
})
export class StoresListComponent implements OnInit {

  canDelete = false;

  @Input() selectedStoreListId?: number;

  @ViewChild('virtualScroll', {static: false}) virtualScroll: CdkVirtualScrollViewport;

  constructor(
    private storeSidenavService: StoreSidenavService,
    private dbEntityMarkerService: DbEntityMarkerService,
    private mapService: MapService,
    private selectionService: EntitySelectionService,
    private siteService: SiteService,
    private listManagerService: ListManagerService,
    private storeListService: StoreListService
  ) {
  }

  ngOnInit() {
    // If a storeList is provided, used that for the siteMarkers, else use what is on the map
    if (this.selectedStoreListId) {
      this.canDelete = true;
      this.storeListService.getOneById(this.selectedStoreListId).subscribe(storeList => {
          const siteMarkers = this.getSiteMarkersForStoreList(storeList);
          this.storeSidenavService.updateSiteMarkers(siteMarkers);
        });
    } else {
      this.storeSidenavService.updateSiteMarkers(this.dbEntityMarkerService.getVisibleSiteMarkers());
      this.dbEntityMarkerService.visibleMarkersChanged$.subscribe(() => {
        this.storeSidenavService.updateSiteMarkers(this.dbEntityMarkerService.getVisibleSiteMarkers())
      });
    }

    this.selectionService.singleSelect$.subscribe(selection => this.scrollToStore(selection.storeId));
  }

  siteIsSelected(siteId: number) {
    return this.selectionService.siteIds.has(siteId);
  }

  storeIsSelected(storeId: number) {
    return this.selectionService.storeIds.has(storeId);
  }

  get siteMarkers() {
    return this.storeSidenavService.siteMarkers;
  }

  get sortType() {
    return this.storeSidenavService.sortType;
  }

  get sortDirection() {
    return this.storeSidenavService.sortDirection;
  }

  sortStores() {
    this.storeSidenavService.sortSiteMarkers()
  }

  get fetching() {
    return this.storeSidenavService.fetching;
  }

  get sortGroups() {
    return this.storeSidenavService.sortGroups;
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

  private scrollToStore(storeId: number) {
    const index = this.siteMarkers.findIndex(sm => sm.stores.find(st => st.id === storeId) !== null);
    this.virtualScroll.scrollToIndex(index);
  }

  /**
   * Groups all stores of the same site into the same siteMarker object, since store lists only contain stores
   */
  private getSiteMarkersForStoreList(storeList: StoreList): SiteMarker[] {
    const siteMarkers = {};
    storeList.stores.forEach((store: SimplifiedStore) => {
      if (!siteMarkers[store.site.id]) {
        const sm = new SiteMarker(store.site);
        sm.stores = [];
        siteMarkers[store.site.id] = sm;
      }
      siteMarkers[store.site.id].stores.push(new StoreMarker(store));
    });
    return Object.keys(siteMarkers).map(siteId => siteMarkers[siteId]);
  }

  removeStoreFromList(storeMarker: StoreMarker) {
    const store = new SimplifiedStore(storeMarker);
    this.storeListService.removeStoresFromStoreList(this.selectedStoreListId, [store.id]).subscribe(storeList => {
      const siteMarkers = this.getSiteMarkersForStoreList(storeList);
      this.storeSidenavService.updateSiteMarkers(siteMarkers);
    });
  }
}
