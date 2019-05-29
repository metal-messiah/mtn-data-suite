import { Component, OnInit, ViewChild } from '@angular/core';
import { StoreMarker } from 'app/models/store-marker';
import { SortDirection, SortType, StoreSidenavService } from '../store-sidenav/store-sidenav.service';
import { SiteMarker } from 'app/models/site-marker';
import { SiteService } from 'app/core/services/site.service';
import { Site } from 'app/models/full/site';
import { DbEntityMarkerService } from '../../core/services/db-entity-marker.service';

@Component({
  selector: 'mds-stores-list',
  templateUrl: './stores-list.component.html',
  styleUrls: ['./stores-list.component.css']
})
export class StoresListComponent implements OnInit {

  @ViewChild('listOfStores') listOfStores;

  constructor(
    private storeSidenavService: StoreSidenavService,
    private dbEntityMarkerService: DbEntityMarkerService,
    private siteService: SiteService
  ) { }

  ngOnInit() {
    this.storeSidenavService.updateItems(this.dbEntityMarkerService.getVisibleSiteMarkers());

    this.dbEntityMarkerService.visibleMarkersChanged$.subscribe(v => this.storeSidenavService.updateItems(v));

    this.dbEntityMarkerService.selectionSet$
      .subscribe((selectionSet: { selectedSiteIds: Set<number>, selectedStoreIds: Set<number>, scrollTo: number }) => {
        this.storeSidenavService.setMapSelections(selectionSet);
        if (selectionSet.scrollTo) {
          this.scrollToElem(selectionSet.scrollTo);
        }
      });
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

  get renderer() {
    return this.storeSidenavService.renderer;
  }

  get sortGroups() {
    return this.storeSidenavService.sortGroups;
  }

  getItemIndex(i: number) {
    return `render_${i}`;
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

  getIdForElem(site: SiteMarker, store: StoreMarker): string {
    return store.isEmpty ? `empty_${site.id}` : `${store.id}`;
  }

  shouldHighlight(store: StoreMarker) {
    return this.storeSidenavService.getMapSelections().selectedStoreIds.has(store.id)
  }

  select(siteMarker: SiteMarker, storeMarker: StoreMarker) {
    this.storeSidenavService.select(siteMarker, storeMarker);
  }

  showOnMap(site: SiteMarker) {
    this.storeSidenavService.showOnMap(site);
  }

  getValidStores(siteMarker: SiteMarker) {
    return siteMarker.stores.filter(store => !store.hidden);
  }

  get siteMarkers() {
    return this.storeSidenavService.siteMarkers;
  }

  private scrollToElem(id) {
    const elem = document.getElementById(`${id}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
