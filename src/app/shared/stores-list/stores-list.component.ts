import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StoreMarker } from 'app/models/store-marker';
import { SortDirection, SortType, StoreSidenavService } from '../store-sidenav/store-sidenav.service';
import { SiteMarker } from 'app/models/site-marker';
import { SiteService } from 'app/core/services/site.service';
import { Site } from 'app/models/full/site';
import { Subscription } from 'rxjs';


@Component({
  selector: 'mds-stores-list',
  templateUrl: './stores-list.component.html',
  styleUrls: ['./stores-list.component.css']
})
export class StoresListComponent implements OnInit, OnDestroy {

  @ViewChild('listOfStores') listOfStores;

  scrollSubscription: Subscription;

  constructor(
    private storeSidenavService: StoreSidenavService,
    private siteService: SiteService
  ) { }

  ngOnInit() {
    this.scrollSubscription = this.storeSidenavService.scrollToMapSelectionId$
      .subscribe((id: number) => this.scrollToElem(id));
  }

  ngOnDestroy() {
    this.scrollSubscription.unsubscribe();
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

  getStoreSubtext(item: any, store: StoreMarker) {
    return this.storeSidenavService.getStoreSubtext(item, store);
  }

  getFormattedIntersection(site: Site) {
    return this.siteService.getFormattedIntersection(site);
  }

  getLogoPath(fileName: string) {
    return `https://res.cloudinary.com/mtn-retail-advisors/image/upload/c_limit,h_20/${fileName}`;
  }

  getAddressLabel(item: any) {
    const { address1, city, state } = item;
    if (address1 && city && state) {
      return `${address1}, ${city}, ${state}`
    }
    if (city && state) {
      return `${city}, ${state}`
    }
    if (state) {
      return `${state}`
    }
    return '';
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

  getValidStores(item) {
    return item.stores.filter(store => !store.hidden);
  }

  private scrollToElem(id) {
    const elem = document.getElementById(`${id}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
