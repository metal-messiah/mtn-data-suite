import { Component, OnInit, Input, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { MapService } from 'app/core/services/map.service';
import { StoreService } from 'app/core/services/store.service';
import { DbEntityMarkerService } from 'app/core/services/db-entity-marker.service';
import { SiteMarker } from 'app/models/site-marker';
import { SiteService } from 'app/core/services/site.service';
import { SimplifiedSite } from 'app/models/simplified/simplified-site';
import * as _ from 'lodash';
import { Store } from 'app/models/full/store';
import { StoreMarker } from 'app/models/store-marker';
import { CasingDashboardService } from 'app/casing/casing-dashboard/casing-dashboard.service';
import { StorageService } from 'app/core/services/storage.service';

enum SortType {
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

enum SortDirection {
  ASC,
  DESC
}


@Component({
  selector: 'mds-stores-list',
  templateUrl: './stores-list.component.html',
  styleUrls: ['./stores-list.component.css']
})
export class StoresListComponent implements OnInit, OnDestroy {
  private items: SiteMarker[] = [];

  fetching = false;
  subscriptions = [];

  sortType: SortType = SortType.ALPHABETICAL;
  sortDirection: SortDirection = SortDirection.ASC;

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

  @Output() onFetching = new EventEmitter<boolean>();

  @ViewChild('listOfStores') listOfStores;

  constructor(
    private storeService: StoreService,
    private mapService: MapService,
    private dbEntityMarkerService: DbEntityMarkerService,
    private siteService: SiteService,
    private casingDashboardService: CasingDashboardService,
    private storageService: StorageService
  ) { }

  ngOnInit() {

    // for (const key in SortType) {
    //   if (typeof SortType[SortType[key]] === 'string') {
    //     this.sortKeys.push(SortType[SortType[key]]);
    //   }
    // };

    this.getSettings();


    this.updateItems(this.dbEntityMarkerService.getVisibleMarkers());

    if (!this.subscriptions.length) {
      this.subscriptions.push(
        this.dbEntityMarkerService.visibleMarkersChanged$.subscribe((visibleMarkers: google.maps.Marker[]) => {
          this.updateItems(visibleMarkers)
        })
      )
    }
  }

  ngOnDestroy() {
    this.dbEntityMarkerService.onDestroy();
  }

  getSettings() {
    this.storageService.getOne(this.sortTypeStorageKey).subscribe((sortType: SortType) => {
      this.sortType = sortType;
    })

    this.storageService.getOne(this.sortDirectionStorageKey).subscribe((sortDirection: SortDirection) => {
      this.sortDirection = sortDirection;
    })
  }

  updateItems(visibleMarkers: google.maps.Marker[]) {
    this.items = [];

    if (visibleMarkers.length) {
      this.fetching = true;
      this.emitFetching();

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

        this.sortItems()
        this.fetching = false;
        this.emitFetching();
      })
    }
  }

  emitFetching() {
    this.onFetching.emit(this.fetching);
  }

  setSortOptions(sortType?: SortType, sortDirection?: SortDirection) {
    this.sortType = sortType ? sortType : this.sortType;
    this.sortDirection = sortDirection ? sortDirection : this.sortDirection;

    this.storageService.set(this.sortTypeStorageKey, this.sortType);
    this.storageService.set(this.sortDirectionStorageKey, this.sortDirection);

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
  }

  getStoresForSort(itemA: SiteMarker, itemB: SiteMarker) {
    const activeStoresA = itemA.stores.filter(s => s.storeType === 'ACTIVE');
    const storeA = activeStoresA.length ? activeStoresA[0] : itemA.stores.length ? itemA.stores[0] : null;
    const activeStoresB = itemB.stores.filter(s => s.storeType === 'ACTIVE');
    const storeB = activeStoresB.length ? activeStoresB[0] : itemB.stores.length ? itemB.stores[0] : null;

    return { storeA, storeB };
  }

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



  showOnMap(storeMarker: StoreMarker) {
    this.storeService.getOneById(storeMarker.id).subscribe((store: Store) => {
      this.mapService.setCenter({
        lat: store.site.latitude,
        lng: store.site.longitude
      });
    })
  }

  siteHover(store, type) {
    if (type === 'enter') {
      this.dbEntityMarkerService.selectStore(store.id);
    } else {
      this.dbEntityMarkerService.clearSelection();
    }
  }

  select(siteMarker: SiteMarker, storeMarker: StoreMarker) {
    this.casingDashboardService.selectItemProgrammatically(siteMarker.id, storeMarker.id)
  }

  getLogoPath(fileName: string) {
    return `https://res.cloudinary.com/mtn-retail-advisors/image/upload/c_limit,h_20/${fileName}`;
  }
}
