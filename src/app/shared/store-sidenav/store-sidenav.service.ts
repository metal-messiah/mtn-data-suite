import { Injectable } from '@angular/core';
import { StoreSidenavViews } from './store-sidenav-views';
import { StorageService } from 'app/core/services/storage.service';
import { SiteMarker } from 'app/models/site-marker';
import { StoreMarker } from 'app/models/store-marker';
import { Store } from 'app/models/full/store';
import { forkJoin } from 'rxjs';


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

  private readonly SIDENAV_VIEW_STORAGE_KEY = 'currentPage';
  private readonly SORT_TYPE_STORAGE_KEY = 'storesListSortType';
  private readonly SORT_DIRECTION_STORAGE_KEY = 'storesListSortDirection';

  siteMarkers: SiteMarker[] = [];

  currentView: StoreSidenavViews = null;

  fetching = false;

  sortType: SortType = SortType.STORE_NAME;
  sortDirection: SortDirection = SortDirection.ASC;

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

  constructor(private storageService: StorageService) {
    this.getSettings();
  }

  getSettings() {
    this.storageService.getOne(this.SIDENAV_VIEW_STORAGE_KEY).subscribe(currentView => {
      if (currentView) {
        this.currentView = currentView;
      }
    });

    const getSortType = this.storageService.getOne(this.SORT_TYPE_STORAGE_KEY);
    const getSortDirection = this.storageService.getOne(this.SORT_DIRECTION_STORAGE_KEY);
    forkJoin([getSortType, getSortDirection]).subscribe(sortOptions => {
      this.sortType = sortOptions[0] as SortType;
      this.sortDirection = sortOptions[1] as SortDirection;
      this.sortSiteMarkers();
    });
  }

  setView(view: StoreSidenavViews) {
    this.currentView = view;
    this.storageService.set(this.SIDENAV_VIEW_STORAGE_KEY, this.currentView)
  }

  ////// ITEMS /////
  updateSiteMarkers(siteMarkers: SiteMarker[]) {
    this.siteMarkers = siteMarkers;
    this.sortSiteMarkers();
  }

  /////// SORTING ////
  sortSiteMarkers(): void {
    this.storageService.set(this.SORT_TYPE_STORAGE_KEY, this.sortType);
    this.storageService.set(this.SORT_DIRECTION_STORAGE_KEY, this.sortDirection);

    switch (this.sortType) {
      case SortType.STORE_NAME:
        this.siteMarkers.sort((itemA, itemB) => {
          // try to sort ALPHABETICALLY by ACTIVE store, if NO ACTIVE stores, use the first available store in array...
          const {storeA, storeB} = this.getStoresForSort(itemA, itemB);
          return storeA && storeB ? storeA.storeName.localeCompare(storeB.storeName) : 0;
        });
        break;
      case SortType.ASSIGNEE_NAME:
        this.siteMarkers.sort((itemA, itemB) => {
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
        this.siteMarkers.sort((itemA, itemB) => {
          return itemA.backfilledNonGrocery === itemB.backfilledNonGrocery ? 0 : itemA.backfilledNonGrocery ? -1 : 1;
        });
        break;
      case SortType.CREATED_DATE:
        this.siteMarkers.sort((itemA, itemB) => {
          // try to sort by CREATED DATE using the ACTIVE store... if NO ACTIVE stores, use the first available store in array...
          const {storeA, storeB} = this.getStoresForSort(itemA, itemB);
          return storeA.createdDate.getTime() - storeB.createdDate.getTime();
        });
        break;
      case SortType.FLOAT:
        this.siteMarkers.sort((itemA, itemB) => {
          // try to sort by FLOAT using the ACTIVE store... if NO ACTIVE stores, use the first available store in array...
          const {storeA, storeB} = this.getStoresForSort(itemA, itemB);

          if (storeA && storeB) {
            return storeA.float === storeB.float ? 0 : storeA.float ? -1 : 1;
          }
          return 0;
        });
        break;
      case SortType.LATITUDE:
        this.siteMarkers.sort((itemA, itemB) => itemA.latitude - itemB.latitude);
        break;
      case SortType.LONGITUDE:
        this.siteMarkers.sort((itemA, itemB) => itemA.longitude - itemB.longitude);
        break;
      case SortType.STORE_TYPE:
        this.siteMarkers.sort((itemA, itemB) => {
          // try to sort STORE TYPE by ACTIVE store, if NO ACTIVE stores, use the first available store in array...
          const {storeA, storeB} = this.getStoresForSort(itemA, itemB);
          return storeA && storeB ? storeA.storeType.localeCompare(storeB.storeType) : 0;
        });
        break;
      case SortType.VALIDATED_DATE:
        this.siteMarkers.sort((itemA, itemB) => {
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

  getVisibleStoreIds() {
    const visibleIds = [];
    this.siteMarkers.forEach((siteMarker: SiteMarker) => {
      return siteMarker.stores.forEach((store: StoreMarker) => {
        if (!store.hidden) {
          visibleIds.push(store.id);
        }
      })
    });
    return visibleIds;
  }

}
