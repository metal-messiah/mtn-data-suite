import { EventEmitter, Injectable } from '@angular/core';
import { Pages } from './store-sidenav-pages';
import { StorageService } from 'app/core/services/storage.service';
import { SiteMarker } from 'app/models/site-marker';
import { DbEntityMarkerService } from 'app/core/services/db-entity-marker.service';

import * as _ from 'lodash';
import { SiteService } from 'app/core/services/site.service';
import { StoreMarker } from 'app/models/store-marker';
import { StoreService } from 'app/core/services/store.service';
import { MapService } from 'app/core/services/map.service';
import { Store } from 'app/models/full/store';
import { SimplifiedSite } from 'app/models/simplified/simplified-site';
import { forkJoin, Subject } from 'rxjs';
import { CasingDashboardService } from 'app/casing/casing-dashboard/casing-dashboard.service';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { finalize, map } from 'rxjs/operators';
import { Coordinates } from '../../models/coordinates';


export enum SortType {
  ASSIGNEE_NAME = 'Assignee Name',
  BACK_FILLED_NON_GROCERY = 'Back-filled by non-grocery',
  CREATED_DATE = 'Created Date',
  LATITUDE = 'Latitude',
  LONGITUDE = 'Longitude',
  FLOAT = 'Store Is Float',
  STORE_NAME = 'Store Name',
  STORE_TYPE = 'Store Type',
  VALIDATED_DATE = 'Validated Date'
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

  private mapSelections = {
    selectedSiteIds: new Set(),
    selectedStoreIds: new Set(),
    scrollTo: 0
  };

  scrollToMapSelectionId$ = new Subject<number>();

  pages = Pages;
  currentPage: Pages = null;

  sidenavPageStorageKey = 'currentPage';

  fetching = false;

  sortType: SortType = SortType.STORE_NAME;
  sortDirection: SortDirection = SortDirection.ASC;

  sort$ = new EventEmitter();

  private readonly sortTypeStorageKey = 'storesListSortType';
  private readonly sortDirectionStorageKey = 'storesListSortDirection';

  readonly sortGroups = [
    {
      name: 'Store', keys: [
        SortType.STORE_NAME,
        SortType.STORE_TYPE,
        SortType.FLOAT,
        SortType.CREATED_DATE,
        SortType.VALIDATED_DATE
      ]
    }, {
      name: 'Site', keys: [
        SortType.LATITUDE,
        SortType.LONGITUDE,
        SortType.ASSIGNEE_NAME,
        SortType.BACK_FILLED_NON_GROCERY
      ]
    }
  ];

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
      );

      this.subscriptions.push(
        this.dbEntityMarkerService.selectionSet$
          .subscribe((selectionSet: { selectedSiteIds: Set<number>, selectedStoreIds: Set<number>, scrollTo: number }) => {
            this.mapSelections = selectionSet;
            if (this.mapSelections.scrollTo) {
              this.scrollToMapSelectionId$.next(this.mapSelections.scrollTo);
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
    });

    const getSortType = this.storageService.getOne(this.sortTypeStorageKey);
    const getSortDirection = this.storageService.getOne(this.sortDirectionStorageKey);
    forkJoin(getSortType, getSortDirection).subscribe(sortOptions => {
      const sortType = sortOptions[0] as SortType;
      const sortDirection = sortOptions[1] as SortDirection;
      this.setSortOptions(sortType, sortDirection);
    });
  }

  setPage(page: Pages) {
    this.currentPage = page;
    this.storageService.set(this.sidenavPageStorageKey, this.currentPage)
  }

  ////// ITEMS /////

  updateItems(visibleMarkers: google.maps.Marker[]) {
    // drop items that aren't in the visible marker set, no reason to store them, and no reason to drop them all and build from scratch
    this.items = this.items.filter(item => visibleMarkers.map(m => m['site'].id).includes(item.id));

    // only get full data for visible markers not in items, to reduce server bandwidth
    visibleMarkers = visibleMarkers.filter(m => !this.items.map(i => i.id).includes(m['site'].id));

    if (visibleMarkers.length) {

      // Sort site's stores by type (Active, Future, Historical), then add the site marker to items
      visibleMarkers.forEach(m => {
        m['site']['stores'].sort((storeA, storeB) => storeA.storeType.localeCompare(storeB.storeType));
        this.items.push(new SiteMarker(m['site']));
      });

      this.items = _.uniqBy(this.items, 'id');

      // Get all Sites for visible site markers
      this.fetching = true;
      this.siteService.getAllByIds(this.items.map(item => item.id))
        .pipe(finalize(() => this.fetching = false))
        .subscribe((sites: SimplifiedSite[]) => {
          sites.forEach(site => {
            const itemIdx = this.items.findIndex((i) => i.id === site.id);
            this.items[itemIdx] = Object.assign({}, this.items[itemIdx], site);
          });

          // Loop through stores array and check if NONE of them are active, but they want to see active AND empty
          this.items.forEach(item => {
            const active = item.stores.filter(store => store.storeType === 'ACTIVE');
            const shouldShowActive = this.dbEntityMarkerService.controls.get('showActive').value;
            const shouldShowEmpty = this.dbEntityMarkerService.controls.get('showEmptySites').value;
            if (active.length === 0 && shouldShowActive && shouldShowEmpty && !this.emptyMappings[item.id]) {
              const psuedoId = this.emptyMappings[item.id] ? this.emptyMappings[item.id] : Math.round(Math.random() * 10000000);
              item.stores.push(new StoreMarker({
                id: psuedoId,
                storeName: 'EMPTY SITE',
                isEmpty: true
              }));

              this.emptyMappings[item.id] = this.emptyMappings[item.id] ? this.emptyMappings[item.id] : psuedoId;
            }
          });

          this.sortItems(this.items);

          this.setRenderer();
        })
    } else {
      this.setRenderer();
    }
  }

  setRenderer() {
    this.renderer = this.items.slice(0, this.loadingConstraint);

    const elem = document.querySelector('.sidenav-content');
    if (elem) {
      elem.removeEventListener('scroll', () => this.reachedBottom(), false);
      elem.addEventListener('scroll', () => this.reachedBottom(), false);
    }
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

  setSortOptions(sortType?: SortType, sortDirection?: SortDirection) {
    this.sortType = sortType !== null ? sortType : this.sortType;
    this.sortDirection = sortDirection !== null ? sortDirection : this.sortDirection;

    this.storageService.set(this.sortTypeStorageKey, this.sortType);
    this.storageService.set(this.sortDirectionStorageKey, this.sortDirection);

    this.sort$.emit();

    this.sortItems(this.items);

    this.setRenderer();
  }

  sortItems(items) {
    switch (this.sortType) {
      case SortType.STORE_NAME:
        items.sort((itemA: SiteMarker, itemB: SiteMarker) => {
          // try to sort ALPHABETICALLY by ACTIVE store, if NO ACTIVE stores, use the first available store in array...
          const { storeA, storeB } = this.getStoresForSort(itemA, itemB);
          return storeA.storeName.localeCompare(storeB.storeName);
        });
        break;
      case SortType.ASSIGNEE_NAME:
        items.sort((itemA: SiteMarker, itemB: SiteMarker) => {
          if (itemA.assigneeName) {
            if (itemB.assigneeName) {
              return itemA.assigneeName.localeCompare(itemB.assigneeName);
            } else {
              return -1
            }
          } else {
            return 1
          }
        });
        break;
      case SortType.BACK_FILLED_NON_GROCERY:
        items.sort((itemA: SiteMarker, itemB: SiteMarker) => {
          return itemA.backfilledNonGrocery === itemB.backfilledNonGrocery ? 0 : itemA.backfilledNonGrocery ? -1 : 1;
        });
        break;
      case SortType.CREATED_DATE:
        items.sort((itemA: SiteMarker, itemB: SiteMarker) => {
          // try to sort by CREATED DATE using the ACTIVE store... if NO ACTIVE stores, use the first available store in array...
          const { storeA, storeB } = this.getStoresForSort(itemA, itemB);
          return storeA.createdDate.getTime() - storeB.createdDate.getTime();
        });
        break;
      case SortType.FLOAT:
        items.sort((itemA: SiteMarker, itemB: SiteMarker) => {
          // try to sort by FLOAT using the ACTIVE store... if NO ACTIVE stores, use the first available store in array...
          const { storeA, storeB } = this.getStoresForSort(itemA, itemB);

          if (storeA && storeB) {
            return storeA.float === storeB.float ? 0 : storeA.float ? -1 : 1;
          }
          return 0;
        });
        break;
      case SortType.LATITUDE:
        items.sort((itemA: SiteMarker, itemB: SiteMarker) => itemA.latitude - itemB.latitude);
        break;
      case SortType.LONGITUDE:
        items.sort((itemA: SiteMarker, itemB: SiteMarker) => itemA.longitude - itemB.longitude);
        break;
      case SortType.STORE_TYPE:
        items.sort((itemA: SiteMarker, itemB: SiteMarker) => {
          // try to sort STORE TYPE by ACTIVE store, if NO ACTIVE stores, use the first available store in array...
          const { storeA, storeB } = this.getStoresForSort(itemA, itemB);
          return storeA.storeType.localeCompare(storeB.storeType);
        });
        break;
      case SortType.VALIDATED_DATE:
        items.sort((itemA: SiteMarker, itemB: SiteMarker) => {
          // try to sort by CREATED DATE using the ACTIVE store... if NO ACTIVE stores, use the first available store in array...
          const { storeA, storeB } = this.getStoresForSort(itemA, itemB);
          return storeA.validatedDate.getTime() - storeB.validatedDate.getTime();
        });
        break;
    }

    if (this.sortDirection === SortDirection.DESC) {
      this.items.reverse();
    }
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
    let text = this.sortType.toString();
    switch (this.sortType) {
      case SortType.ASSIGNEE_NAME:
        return item.assigneeName ? `${text}: ${item.assigneeName}` : 'Not Assigned';
      case SortType.BACK_FILLED_NON_GROCERY:
        return text += `: ${item.backfilledNonGrocery}`;
      case SortType.CREATED_DATE:
        return text += `: ${new Date(store.createdDate).toLocaleDateString()}`;
      case SortType.FLOAT:
        return text += `: ${store.float ? store.float : 'False'}`;
      case SortType.LATITUDE:
        return text += `: ${item.latitude}`;
      case SortType.LONGITUDE:
        return text += `: ${item.longitude}`;
      case SortType.VALIDATED_DATE:
        return text += `: ${new Date(store.validatedDate).toLocaleDateString()}`;
      default:
        return store.storeType;
    }
  }

  showOnMap(site: SiteMarker) {
    this.mapService.setCenter({
      lat: site.latitude,
      lng: site.longitude
    });
  }

  getSelectedDashboardMode() {
    return this.casingDashboardService.getSelectedDashboardMode();
  }

  select(siteMarker: SiteMarker, storeMarker: StoreMarker) {
    if (this.getSelectedDashboardMode() !== 4) {
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
    });
    this.dbEntityMarkerService.selectStores(visibleIds);
  }

  selectAllByIds(ids: number[]) {
    this.dbEntityMarkerService.selectStores(ids);
  }

  zoomToSelectionSet() {
    const requests = [];
    if (this.mapSelections.selectedStoreIds.size) {
      requests.push(this.storeService.getAllByIds(Array.from(this.mapSelections.selectedStoreIds))
        .pipe(map((stores: SimplifiedStore[]) =>
          stores.map((s: SimplifiedStore) => new Coordinates(s.site.latitude, s.site.longitude)))));
    }
    if (this.mapSelections.selectedSiteIds.size) {
      requests.push(this.siteService.getAllByIds(Array.from(this.mapSelections.selectedSiteIds))
        .pipe(map((sites: SimplifiedSite[]) =>
          sites.map((s: SimplifiedSite) => new Coordinates(s.latitude, s.longitude)))));
    }

    forkJoin(requests).subscribe(results => {
      const points = [].concat(...results);
      this.mapService.fitToPoints(points);
    });
  }
}
