import { Injectable } from '@angular/core';
import { Pages } from './store-sidenav-pages';
import { StorageService } from 'app/core/services/storage.service';
import { SiteMarker } from 'app/models/site-marker';
import { DbEntityMarkerService } from 'app/core/services/db-entity-marker.service';

import * as _ from 'lodash';
import { SiteService } from 'app/core/services/site.service';
import { StoreMapLayer } from 'app/models/store-map-layer';
import { StoreMarker } from 'app/models/store-marker';
import { StoreService } from 'app/core/services/store.service';
import { MapService } from 'app/core/services/map.service';
import { Store } from 'app/models/full/store';
import { SimplifiedSite } from 'app/models/simplified/simplified-site';
import { Subject, BehaviorSubject } from 'rxjs';
import { CasingDashboardService } from 'app/casing/casing-dashboard/casing-dashboard.service';
import { UpdateService } from 'app/core/services/update.service';
import { CasingDashboardMode } from 'app/casing/casing-dashboard/casing-dashboard.component';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { isObject } from 'util';


export enum SortType {
  ALPHABETICAL,
  LAT,
  LNG,
  VALIDATEDDATE,
  CREATEDDATE,
  FLOAT,
  ASSIGNEEID,
  DUPLICATE,
  BACKFILLEDNONGROCERY,
  STORETYPE
}

export enum SortDirection {
  ASC,
  DESC
}

@Injectable({
  providedIn: 'root'
})
export class StoreSidenavService {

  private items: SiteMarker[] = [];
  items$: BehaviorSubject<SiteMarker[]> = new BehaviorSubject(this.items);

  private mapSelections: {
    selectedSiteIds: Set<number>,
    selectedStoreIds: Set<number>,
    scrollTo: number
  } = {
      selectedSiteIds: new Set(),
      selectedStoreIds: new Set(),
      scrollTo: null
    };

  scrollToMapSelectionId$ = new Subject<number>();

  pages = Pages;
  public currentPage: Pages = null;

  sidenavPageStorageKey = 'currentPage';

  fetching = false;

  sortType: SortType = SortType.ALPHABETICAL;
  sortDirection: SortDirection = SortDirection.ASC;

  sortType$: BehaviorSubject<SortType> = new BehaviorSubject(this.sortType);
  sortDirection$: BehaviorSubject<SortDirection> = new BehaviorSubject(this.sortDirection);

  sortTypeStorageKey = 'storesListSortType';
  sortDirectionStorageKey = 'storesListSortDirection';

  sortGroups = [
    {
      name: 'Store', keys: [
        { label: 'Store Name', enumIndex: 0 },
        { label: 'Store Type', enumIndex: 9 },
        { label: 'Float', enumIndex: 5 },
        { label: 'Created Date', enumIndex: 4 },
        { label: 'Validated Date', enumIndex: 3 }
      ]
    }, {
      name: 'Site', keys: [
        { label: 'Latitude', enumIndex: 1 },
        { label: 'Longitude', enumIndex: 2 },
        { label: 'Assignee ID', enumIndex: 6 },
        { label: 'Duplicate', enumIndex: 7 },
        { label: 'Backfilled Non Grocery', enumIndex: 8 }
      ]
    }
  ]

  subscriptions = [];

  emptyMappings = {};


  loadingConstraint = 20;
  renderer = [];

  constructor(
    private storageService: StorageService,
    private dbEntityMarkerService: DbEntityMarkerService,
    private siteService: SiteService,
    private storeService: StoreService,
    private mapService: MapService,
    private casingDashboardService: CasingDashboardService
  ) {

    this.getSettings();

    this.updateItems(this.dbEntityMarkerService.getVisibleMarkers());

    if (!this.subscriptions.length) {
      this.subscriptions.push(
        this.dbEntityMarkerService.visibleMarkersChanged$.subscribe((visibleMarkers: google.maps.Marker[]) => {
          this.updateItems(visibleMarkers)
        })
      )

      this.subscriptions.push(
        this.dbEntityMarkerService.selectionSet$.subscribe((selectionSet: { selectedSiteIds: Set<number>, selectedStoreIds: Set<number>, scrollTo: number }) => {
          this.mapSelections = selectionSet;
          const { scrollTo } = this.mapSelections;
          if (scrollTo) {
            this.scrollToMapSelectionId$.next(scrollTo);
          }
        })
      )

    }


  }

  getSettings() {

    this.storageService.getOne(this.sidenavPageStorageKey).subscribe((currentPage) => {
      if (currentPage !== undefined) {
        this.currentPage = currentPage;
      }
    })

    this.storageService.getOne(this.sortTypeStorageKey).subscribe((sortType: SortType) => {
      this.setSortOptions(sortType, null);
    })

    this.storageService.getOne(this.sortDirectionStorageKey).subscribe((sortDirection: SortDirection) => {
      this.setSortOptions(null, sortDirection);
    })
  }

  getPage() {
    return this.currentPage;
  }

  setPage(page: Pages) {
    this.currentPage = page;
    this.storageService.set(this.sidenavPageStorageKey, this.currentPage)
  }


  getFetching(): boolean {
    return this.fetching;
  }

  setFetching(fetching: boolean): void {
    this.fetching = fetching;
  }

  ////// ITEMS /////

  updateItems(visibleMarkers: google.maps.Marker[]) {
    this.items = [];

    if (visibleMarkers.length) {
      this.setFetching(true)

      visibleMarkers.forEach(m => {
        m['site']['stores'].sort((storesA, storesB) => storesA.storeType < storesB.storeType ? -1 : storesA.storeType > storesB.storeType ? 1 : 0);
        this.items.push(new SiteMarker(m['site']));
      });


      this.items = _.uniqBy(this.items, 'id');

      this.siteService.getAllByIds(this.items.map(item => item.id)).subscribe((sites: SimplifiedSite[]) => {
        sites.forEach(site => {
          const itemIdx = this.items.findIndex((i) => i.id === site.id)
          this.items[itemIdx] = Object.assign({}, this.items[itemIdx], site);
        })


        // Loop through stores array and check if NONE of them are active, but they want to see active AND empty
        this.items.forEach(item => {
          const active = item.stores.filter(store => store.storeType === 'ACTIVE');
          const shouldShowActive = this.dbEntityMarkerService.controls.get('showActive').value;
          const shouldShowEmpty = this.dbEntityMarkerService.controls.get('showEmptySites').value;
          if (active.length === 0 && shouldShowActive && shouldShowEmpty) {
            const psuedoId = this.emptyMappings[item.id] ? this.emptyMappings[item.id] : Math.round(Math.random() * 10000000);
            item.stores.push(new StoreMarker({
              id: psuedoId,
              storeName: 'EMPTY SITE',
              isEmpty: true
            }));

            this.emptyMappings[item.id] = this.emptyMappings[item.id] ? this.emptyMappings[item.id] : psuedoId;
          }
        })

        this.sortItems()
        this.setFetching(false)

      })
    }
  }

  getItems(): SiteMarker[] {
    return this.items;
  }

  setItems(items: SiteMarker[]) {
    this.items = items;
  }

  getRenderer() {
    return this.renderer;
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

  /////////////
  //////////// SORTING ////

  getSortType(): SortType {
    return this.sortType;
  }

  setSortType(sortType: SortType) {
    this.sortType = sortType;
  }

  getSortGroups() {
    return this.sortGroups;
  }

  getSortDirection(): SortDirection {
    return this.sortDirection;
  }

  setSortOptions(sortType?: SortType, sortDirection?: SortDirection) {
    this.sortType = sortType !== null ? sortType : this.sortType;
    this.sortDirection = sortDirection !== null ? sortDirection : this.sortDirection;

    this.storageService.set(this.sortTypeStorageKey, this.sortType);
    this.storageService.set(this.sortDirectionStorageKey, this.sortDirection);

    this.sortType$.next(this.sortType);
    this.sortDirection$.next(this.sortDirection);

    this.sortItems();
  }

  sortItems() {
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

    // the list updated, so if there is an active selection scroll to it

    this.items$.next(this.items);

    this.setRenderer();
  }

  getStoresForSort(itemA: SiteMarker, itemB: SiteMarker) {
    const activeStoresA = itemA.stores.filter(s => s.storeType === 'ACTIVE');
    const storeA = activeStoresA.length ? activeStoresA[0] : itemA.stores.length ? itemA.stores[0] : null;
    const activeStoresB = itemB.stores.filter(s => s.storeType === 'ACTIVE');
    const storeB = activeStoresB.length ? activeStoresB[0] : itemB.stores.length ? itemB.stores[0] : null;

    return { storeA, storeB };
  }


  ////////////// MAP SELECTIONS /////////////

  getMapSelections(): { selectedSiteIds: Set<number>, selectedStoreIds: Set<number> } {
    return this.mapSelections;
  }

  setMapSelections(mapSelections: { selectedSiteIds: Set<number>, selectedStoreIds: Set<number>, scrollTo: number }) {
    this.mapSelections = mapSelections;
  }

  ////// TEMPLATE STUFF ////////////

  getStoreSubtext(item: any, store: StoreMarker) {
    if (this.sortType === SortType.ASSIGNEEID) {
      return `Assignee ID: ${item.assigneeId}`;
    }
    if (this.sortType === SortType.BACKFILLEDNONGROCERY) {
      return `Backfilled Non-Grocery: ${item.backfilledNonGrocery}`;
    }
    if (this.sortType === SortType.CREATEDDATE) {
      return `Created: ${new Date(store.createdDate).toLocaleDateString()}`;
    }
    if (this.sortType === SortType.DUPLICATE) {
      return `Duplicate: ${item.duplicate}`;
    }
    if (this.sortType === SortType.FLOAT) {
      return `Float: ${store.float ? store.float : 'False'}`;
    }
    if (this.sortType === SortType.LAT) {
      return `Latitude: ${item.latitude}`;
    }
    if (this.sortType === SortType.LNG) {
      return `Longitude: ${item.longitude}`;
    }
    if (this.sortType === SortType.VALIDATEDDATE) {
      return `Validated: ${new Date(store.validatedDate).toLocaleDateString()}`;
    }

    return store.storeType
  }

  showOnMap(site: SiteMarker) {

    this.mapService.setCenter({
      lat: site.latitude,
      lng: site.longitude
    });

  }

  siteHover(store, type) {
    if (type === 'enter') {
      this.dbEntityMarkerService.selectStores([store.id]);
    } else {
      this.dbEntityMarkerService.clearSelection();
    }
  }

  getSelectedDashboardMode() {
    return this.casingDashboardService.getSelectedDashboardMode();
  }



  select(siteMarker: SiteMarker, storeMarker: StoreMarker) {
    if (this.getSelectedDashboardMode() !== CasingDashboardMode.MULTI_SELECT) {
      // open the info card
      this.casingDashboardService.selectItemProgrammatically(siteMarker, storeMarker)
    } else {
      // just select it
      if (storeMarker.id) {
        this.dbEntityMarkerService.selectStores([storeMarker.id]);
      }
      if (siteMarker && siteMarker.id && storeMarker.isEmpty) {
        this.dbEntityMarkerService.selectSites([siteMarker.id]);
      }
    }
  }

  selectAllVisible() {
    const visibleIds = [];
    this.items.forEach((i: SiteMarker) => {
      return i.stores.forEach((store: StoreMarker) => {
        visibleIds.push(store.id);
      })
    })
    this.dbEntityMarkerService.selectStores(visibleIds);
  }

  selectAllByIds(ids: number[]) {
    this.dbEntityMarkerService.selectStores(ids);
  }

  zoomToSelectionSet() {
    if (this.mapSelections.selectedStoreIds.size) {
      this.storeService.getAllByIds(Array.from(this.mapSelections.selectedStoreIds)).subscribe((stores: SimplifiedStore[]) => {
        const storeGeoms = stores.map((s: SimplifiedStore) => {
          return { lat: s.site.latitude, lng: s.site.longitude }
        });

        if (this.mapSelections.selectedSiteIds.size) {
          this.siteService.getAllByIds(Array.from(this.mapSelections.selectedSiteIds)).subscribe((sites: SimplifiedSite[]) => {
            const siteGeoms = sites.map((s: SimplifiedSite) => {
              return { lat: s.latitude, lng: s.longitude }
            });

            const geoms = storeGeoms.concat(siteGeoms);
            const bounds = this.mapService.getBoundsOfPoints(geoms);
            this.mapService.getMap().fitBounds(bounds);
          })
        } else {
          const bounds = this.mapService.getBoundsOfPoints(storeGeoms);
          this.mapService.getMap().fitBounds(bounds);
        }
      })
    }
  }
}
