import { EventEmitter, Injectable } from '@angular/core';
import { Pages } from './store-sidenav-pages';
import { StorageService } from 'app/core/services/storage.service';
import { SiteMarker } from 'app/models/site-marker';
import { DbEntityMarkerService } from 'app/core/services/db-entity-marker.service';
import { SiteService } from 'app/core/services/site.service';
import { StoreMarker } from 'app/models/store-marker';
import { StoreService } from 'app/core/services/store.service';
import { MapService } from 'app/core/services/map.service';
import { Store } from 'app/models/full/store';
import { SimplifiedSite } from 'app/models/simplified/simplified-site';
import { forkJoin } from 'rxjs';
import { CasingDashboardService } from 'app/casing/casing-dashboard/casing-dashboard.service';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { map } from 'rxjs/operators';
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

@Injectable()
export class StoreSidenavService {

  siteMarkers: SiteMarker[] = [];

  private mapSelections = {
    selectedSiteIds: new Set(),
    selectedStoreIds: new Set(),
    scrollTo: 0
  };

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

  private readonly LOADING_CONSTRAINT = 20;
  renderer: SiteMarker[] = [];

  constructor(
    private storageService: StorageService,
    private dbEntityMarkerService: DbEntityMarkerService,
    private siteService: SiteService,
    private storeService: StoreService,
    private mapService: MapService,
    private casingDashboardService: CasingDashboardService
  ) {
    this.getSettings();
  }

  getSettings() {
    this.storageService.getOne(this.sidenavPageStorageKey).subscribe(currentPage => {
      if (currentPage) {
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

  updateItems(siteMarkers: SiteMarker[]) {

    this.siteMarkers = siteMarkers;
    // Hide stores based on Controls
    this.siteMarkers.forEach(site => {
      site.stores.forEach(store => store.hidden = !this.dbEntityMarkerService.includeStore(store, site));
    });

    this.sortItems(this.siteMarkers);

    this.setRenderer();
  }

  /***
   *   The renderer is set when
   *   - The site details are retrieved
   *   -
   */
  setRenderer() {
    // The renderer a sub-set of the siteMarkers array
    this.renderer = this.siteMarkers.slice(0, this.LOADING_CONSTRAINT);

    // When the renderer is set the scroll listener is removed and then added again...
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
    if (index < this.siteMarkers.length) {
      const additionalRenders = this.siteMarkers.slice(index, index + this.LOADING_CONSTRAINT);
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

    this.sortItems(this.siteMarkers);

    this.setRenderer();
  }

  sortItems(siteMarkers: SiteMarker[]) {
    switch (this.sortType) {
      case SortType.STORE_NAME:
        siteMarkers.sort((itemA, itemB) => {
          // try to sort ALPHABETICALLY by ACTIVE store, if NO ACTIVE stores, use the first available store in array...
          const {storeA, storeB} = this.getStoresForSort(itemA, itemB);
          return storeA && storeB ? storeA.storeName.localeCompare(storeB.storeName) : 0;
        });
        break;
      case SortType.ASSIGNEE_NAME:
        siteMarkers.sort((itemA, itemB) => {
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
        siteMarkers.sort((itemA, itemB) => {
          return itemA.backfilledNonGrocery === itemB.backfilledNonGrocery ? 0 : itemA.backfilledNonGrocery ? -1 : 1;
        });
        break;
      case SortType.CREATED_DATE:
        siteMarkers.sort((itemA, itemB) => {
          // try to sort by CREATED DATE using the ACTIVE store... if NO ACTIVE stores, use the first available store in array...
          const {storeA, storeB} = this.getStoresForSort(itemA, itemB);
          return storeA.createdDate.getTime() - storeB.createdDate.getTime();
        });
        break;
      case SortType.FLOAT:
        siteMarkers.sort((itemA, itemB) => {
          // try to sort by FLOAT using the ACTIVE store... if NO ACTIVE stores, use the first available store in array...
          const {storeA, storeB} = this.getStoresForSort(itemA, itemB);

          if (storeA && storeB) {
            return storeA.float === storeB.float ? 0 : storeA.float ? -1 : 1;
          }
          return 0;
        });
        break;
      case SortType.LATITUDE:
        siteMarkers.sort((itemA, itemB) => itemA.latitude - itemB.latitude);
        break;
      case SortType.LONGITUDE:
        siteMarkers.sort((itemA, itemB) => itemA.longitude - itemB.longitude);
        break;
      case SortType.STORE_TYPE:
        siteMarkers.sort((itemA, itemB) => {
          // try to sort STORE TYPE by ACTIVE store, if NO ACTIVE stores, use the first available store in array...
          const {storeA, storeB} = this.getStoresForSort(itemA, itemB);
          return storeA && storeB ? storeA.storeType.localeCompare(storeB.storeType) : 0;
        });
        break;
      case SortType.VALIDATED_DATE:
        siteMarkers.sort((itemA, itemB) => {
          // try to sort by CREATED DATE using the ACTIVE store... if NO ACTIVE stores, use the first available store in array...
          const {storeA, storeB} = this.getStoresForSort(itemA, itemB);
          return storeA && storeB ? storeA.validatedDate.getTime() - storeB.validatedDate.getTime() : 0;
        });
        break;
    }

    if (this.sortDirection === SortDirection.DESC) {
      this.siteMarkers.reverse();
    }
  }

  getStoresForSort(itemA: SiteMarker, itemB: SiteMarker) {
    const activeStoresA = itemA.stores.filter(s => s.storeType === 'ACTIVE');
    const storeA = activeStoresA.length ? activeStoresA[0] : itemA.stores.length ? itemA.stores[0] : null;
    const activeStoresB = itemB.stores.filter(s => s.storeType === 'ACTIVE');
    const storeB = activeStoresB.length ? activeStoresB[0] : itemB.stores.length ? itemB.stores[0] : null;

    return {storeA, storeB};
  }


  ////////////// MAP SELECTIONS /////////////

  getMapSelections(): { selectedSiteIds: Set<number>, selectedStoreIds: Set<number> } {
    return this.mapSelections;
  }

  setMapSelections(mapSelections: { selectedSiteIds: Set<number>, selectedStoreIds: Set<number>, scrollTo: number }) {
    this.mapSelections = mapSelections;
  }

  ////// TEMPLATE STUFF ////////////

  getStoreSubtext(site: SiteMarker, store: StoreMarker) {
    let text = this.sortType.toString();
    switch (this.sortType) {
      case SortType.ASSIGNEE_NAME:
        return site.assigneeName ? `${text}: ${site.assigneeName}` : 'Not Assigned';
      case SortType.BACK_FILLED_NON_GROCERY:
        return text += `: ${site.backfilledNonGrocery}`;
      case SortType.CREATED_DATE:
        return text += `: ${new Date(store.createdDate).toLocaleDateString()}`;
      case SortType.FLOAT:
        return text += `: ${store.float ? store.float : 'False'}`;
      case SortType.LATITUDE:
        return text += `: ${site.latitude}`;
      case SortType.LONGITUDE:
        return text += `: ${site.longitude}`;
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
    this.siteMarkers.forEach((i: SiteMarker) => {
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
