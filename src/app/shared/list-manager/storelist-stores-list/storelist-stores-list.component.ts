import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { StoreListService } from 'app/core/services/store-list.service';
import { StoreList } from 'app/models/full/store-list';
import { MatDialog } from '@angular/material';
import { ListManagerService } from '../list-manager.service';
import { MapService } from 'app/core/services/map.service';
import { StoreSidenavService, SortType, SortDirection } from 'app/shared/store-sidenav/store-sidenav.service';
import { StoreMarker } from 'app/models/store-marker';
import { SiteMarker } from 'app/models/site-marker';
import { SiteService } from 'app/core/services/site.service';
import { Site } from 'app/models/full/site';
import { SimplifiedSite } from 'app/models/simplified/simplified-site';

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
  renderedCount = this.loadingConstraint;

  sortType: SortType;
  sortDirection: SortDirection;

  isFetching = false;

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
    this.storeSidenavService.sortType$.subscribe((sortType: SortType) => {
      this.sortType = sortType;
      this.sortItems();
    })

    this.storeSidenavService.sortDirection$.subscribe((sortDirection: SortDirection) => {
      this.sortDirection = sortDirection;
      this.sortItems();
    })

    this.storeSidenavService.scrollToMapSelectionId$.subscribe((id: number) => {
      this.scrollToElem(id);
    })

    this.listManagerService.fetching$.subscribe((isFetching: boolean) => {
      this.isFetching = isFetching;
    })

  }

  get selectedStoreList(): StoreList {
    return this.storeList;
  }

  @Input()
  set selectedStoreList(storeList: StoreList) {
    this.storeListService
      .getOneById(storeList.id)
      .subscribe((fullStoreList: StoreList) => {
        this.storeList = fullStoreList;
        // this.updateStoresForRender();
        this.items = this.getItems();
        this.sortItems();
      });
  }

  setStore(store: SimplifiedStore) {
    this.listManagerService.setStores([store]);
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
    })
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

  getSortType() {
    return this.storeSidenavService.getSortType();
  }

  setSortType(sortType: SortType) {
    this.storeSidenavService.setSortType(sortType);
  }

  getSortGroups() {
    return this.storeSidenavService.getSortGroups();
  }

  setSortOptions(sortType?: SortType, sortDirection?: SortDirection) {
    this.storeSidenavService.setSortOptions(sortType, sortDirection);
  }

  sortItems() {
    if (this.items) {
      switch (this.sortType) {
        case SortType.ALPHABETICAL:
          this.items.sort((itemA: SiteMarker, itemB: SiteMarker) => {
            // try to sort ALPHABETICALLY by ACTIVE store, if NO ACTIVE stores, use the first available store in array...
            const { storeA, storeB } = this.getStoresForSort(itemA, itemB);

            if (storeA && storeB) {
              if (storeA.storeName < storeB.storeName) { return -1 };
              if (storeA.storeName > storeB.storeName) { return 1 };
            }
            return 0;
          })
          break;
        case SortType.ASSIGNEEID:
          this.items.sort((itemA: SiteMarker, itemB: SiteMarker) => itemA.assigneeId - itemB.assigneeId);
          break;
        case SortType.BACKFILLEDNONGROCERY:
          this.items.sort((itemA: SiteMarker, itemB: SiteMarker) => itemA.backfilledNonGrocery === itemB.backfilledNonGrocery ? 0 : itemA.backfilledNonGrocery ? -1 : 1);
          break;
        case SortType.CREATEDDATE:
          this.items.sort((itemA: SiteMarker, itemB: SiteMarker) => {
            // try to sort by CREATED DATE using the ACTIVE store... if NO ACTIVE stores, use the first available store in array...
            const { storeA, storeB } = this.getStoresForSort(itemA, itemB);

            if (storeA && storeB) {
              if (storeA.createdDate < storeB.createdDate) { return -1 };
              if (storeA.createdDate > storeB.createdDate) { return 1 };
            }
            return 0;
          })
          break;
        case SortType.DUPLICATE:
          this.items.sort((itemA: SiteMarker, itemB: SiteMarker) => itemA.duplicate === itemB.duplicate ? 0 : itemA.duplicate ? -1 : 1);
          break;
        case SortType.FLOAT:
          this.items.sort((itemA: SiteMarker, itemB: SiteMarker) => {
            // try to sort by FLOAT using the ACTIVE store... if NO ACTIVE stores, use the first available store in array...
            const { storeA, storeB } = this.getStoresForSort(itemA, itemB);

            if (storeA && storeB) {
              return storeA.float === storeB.float ? 0 : storeA.float ? -1 : 1;
            }
            return 0;
          })
          break;
        case SortType.LAT:
          this.items.sort((itemA: SiteMarker, itemB: SiteMarker) => itemA.latitude - itemB.latitude);
          break;
        case SortType.LNG:
          this.items.sort((itemA: SiteMarker, itemB: SiteMarker) => itemA.longitude - itemB.longitude);
          break;
        case SortType.STORETYPE:
          this.items.sort((itemA: SiteMarker, itemB: SiteMarker) => {
            // try to sort STORE TYPE by ACTIVE store, if NO ACTIVE stores, use the first available store in array...

            const { storeA, storeB } = this.getStoresForSort(itemA, itemB);

            if (storeA && storeB) {
              if (storeA.storeType < storeB.storeType) { return -1 };
              if (storeA.storeType > storeB.storeType) { return 1 };
            }
            return 0;
          })
          break;
        case SortType.VALIDATEDDATE:
          this.items.sort((itemA: SiteMarker, itemB: SiteMarker) => {
            // try to sort by CREATED DATE using the ACTIVE store... if NO ACTIVE stores, use the first available store in array...
            const { storeA, storeB } = this.getStoresForSort(itemA, itemB);

            if (storeA && storeB) {
              if (storeA.validatedDate < storeB.validatedDate) { return -1 };
              if (storeA.validatedDate > storeB.validatedDate) { return 1 };
            }
            return 0;
          })
          break;
      }

      if (this.sortDirection === SortDirection.DESC) {
        this.items.reverse();
      }

      this.setRenderer();
    }
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



  getStoresForSort(itemA: SiteMarker, itemB: SiteMarker) {
    const activeStoresA = itemA.stores.filter(s => s.storeType === 'ACTIVE');
    const storeA = activeStoresA.length ? activeStoresA[0] : itemA.stores.length ? itemA.stores[0] : null;
    const activeStoresB = itemB.stores.filter(s => s.storeType === 'ACTIVE');
    const storeB = activeStoresB.length ? activeStoresB[0] : itemB.stores.length ? itemB.stores[0] : null;

    return { storeA, storeB };
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
}
