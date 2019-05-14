import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { StoreListService } from 'app/core/services/store-list.service';
import { StoreList } from 'app/models/full/store-list';
import { MatDialog } from '@angular/material';
import { ListManagerService } from '../list-manager.service';
import { MapService } from 'app/core/services/map.service';
import { SortDirection, SortType, StoreSidenavService } from 'app/shared/store-sidenav/store-sidenav.service';
import { StoreMarker } from 'app/models/store-marker';
import { SiteMarker } from 'app/models/site-marker';
import { SiteService } from 'app/core/services/site.service';
import { Site } from 'app/models/full/site';

@Component({
  selector: 'mds-storelist-stores-list',
  templateUrl: './storelist-stores-list.component.html',
  styleUrls: ['./storelist-stores-list.component.css']
})
export class StorelistStoresListComponent implements OnInit {

  storeList: StoreList;

  items: SiteMarker[];

  loadingConstraint = 20;
  renderer = [];

  @ViewChild('listOfStores') listOfStores;

  constructor(
    private listManagerService: ListManagerService,
    private storeListService: StoreListService,
    protected dialog: MatDialog,
    private mapService: MapService,
    private storeSidenavService: StoreSidenavService,
    private siteService: SiteService
  ) { }

  ngOnInit() {
    this.storeSidenavService.sort$.subscribe(() => {
      this.storeSidenavService.sortItems(this.items);
      this.setRenderer();
    });

    this.storeSidenavService.scrollToMapSelectionId$.subscribe((id: number) => this.scrollToElem(id));
  }

  get fetching() {
    return this.listManagerService.fetching;
  }

  get sortGroups() {
    return this.storeSidenavService.sortGroups;
  }

  get sortType() {
    return this.storeSidenavService.sortType;
  }

  get sortDirection() {
    return this.storeSidenavService.sortDirection;
  }

  @Input()
  set selectedStoreListId(storeListId: number) {
    this.storeListService.getOneById(storeListId)
      .subscribe((fullStoreList: StoreList) => {
        this.storeList = fullStoreList;
        // this.updateStoresForRender();
        this.items = this.getItems();
        this.storeSidenavService.sortItems(this.items);
        this.setRenderer();
      });
  }

  removeStoreFromList(storeMarker: StoreMarker) {
    const store = new SimplifiedStore(storeMarker);
    this.listManagerService.removeFromList(
      [new SimplifiedStoreList(this.storeList)],
      [store]
    );
  }

  getItems(): SiteMarker[] {
    const items = [];
    this.storeList.stores.forEach((store: SimplifiedStore) => {
      const siteMarker = new SiteMarker(store.site);
      const storeMarker = new StoreMarker(store);
      siteMarker.stores = [storeMarker];
      items.push(siteMarker);
    });
    return items;
  }

  showOnMap(site: SiteMarker) {
    this.storeSidenavService.showOnMap(site);
  }

  getItemIndex(i: number) {
    return `render_${i}`;
  }


  select(siteMarker: SiteMarker, storeMarker: StoreMarker) {
    this.storeSidenavService.select(siteMarker, storeMarker);
  }

  scrollToElem(id) {
    const elem = document.getElementById(`${id}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  setSortOptions(sortType?: SortType, sortDirection?: SortDirection) {
    this.storeSidenavService.setSortOptions(sortType, sortDirection);
  }

  setRenderer() {
    this.renderer = this.items.slice(0, this.loadingConstraint);

    const elem = document.querySelector('.sidenav-content');
    elem.removeEventListener('scroll', () => this.reachedBottom(), false);
    elem.addEventListener('scroll', () => this.reachedBottom(), false);
  }

  reachedBottom() {
    const bottomIndex = this.renderer.length - 1;
    const elem = document.getElementById(`render_${bottomIndex}`);
    if (this.isInViewport(elem)) {
      this.updateRenderer();
    }
  }

  isInViewport(elem) {
    if (elem) {
      const bounding = elem.getBoundingClientRect();
      return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
    return false
  };


  updateRenderer() {
    const index = this.renderer.length;
    if (index < this.items.length) {
      const additionalRenders = this.items.slice(index, index + this.loadingConstraint);
      this.renderer = this.renderer.concat(additionalRenders);
    }
  }

  getStoreSubtext(item: any, store: StoreMarker) {
    return this.storeSidenavService.getStoreSubtext(item, store);
  }

  getFormattedIntersection(site: Site) {
    return this.siteService.getFormattedIntersection(site);
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
}
