import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { StoreMarker } from 'app/models/store-marker';
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
import { SortDirection } from '../../core/functionalEnums/sort-direction';
import { Coordinates } from '../../models/coordinates';
import { StorageService } from '../../core/services/storage.service';
import { forkJoin } from 'rxjs';
import { SiteUtil } from '../../utils/SiteUtil';
import { SortType } from '../../core/functionalEnums/site-list-sort-type';
import { MatRadioChange, MatSelectChange, MatTabGroup } from '@angular/material';
import * as _ from 'lodash';
import { tap } from 'rxjs/operators';

class SiteListItem {
  siteId: number;
  address: string;
  intersection: string;
  coords: Coordinates;
  backfilledNonGrocery: boolean;
  empty: boolean;
  assigneeName: string;
  store: StoreMarker;

  constructor(siteMarker: SiteMarker, storeMarker?: StoreMarker) {
    this.siteId = siteMarker.id;
    this.address = this.getAddressLabel(siteMarker);
    this.intersection = this.getFormattedIntersection(siteMarker);
    this.coords = new Coordinates(siteMarker.latitude, siteMarker.longitude);
    this.backfilledNonGrocery = siteMarker.backfilledNonGrocery;
    this.empty = siteMarker.empty;
    this.assigneeName = siteMarker.assigneeName;
    if (storeMarker) {
      this.store = storeMarker;
    }
  }

  private getAddressLabel(siteMarker: SiteMarker) {
    let address = siteMarker.address;
    if (address) {
      address += ', ';
    }
    return address + SiteUtil.getFormattedPrincipality(siteMarker);
  }

  private getFormattedIntersection(site: SiteMarker) {
    return SiteUtil.getFormattedIntersection(site);
  }
}

@Component({
  selector: 'mds-stores-list',
  templateUrl: './stores-list.component.html',
  styleUrls: ['./stores-list.component.css']
})
export class StoresListComponent implements OnInit, OnChanges {

  private readonly SORT_TYPE_STORAGE_KEY = 'storesListSortType';
  private readonly SORT_DIRECTION_STORAGE_KEY = 'storesListSortDirection';
  private readonly STORE_TYPES = ['Empty', 'Historical', 'Active', 'Future'];

  readonly sortGroups = [
    {
      name: 'Store', keys: [
        SortType.STORE_NAME,
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

  readonly storeTabs = [
    {tabTitle: 'Historical', getStores: () => this.historicalStores},
    {tabTitle: 'Active', getStores: () => this.activeStores},
    {tabTitle: 'Future', getStores: () => this.futureStores}
  ];

  fetching = false;

  canDelete = false;
  SortDirection = SortDirection;

  storeType = 'Active';
  sortType: SortType = SortType.STORE_NAME;
  sortDirection: SortDirection = SortDirection.ASC;

  emptySites = [];
  historicalStores = [];
  activeStores = [];
  futureStores = [];

  selectedTabIndex = 2;

  @Input() siteMarkers = [];

  @ViewChild('tabGroup', {static: false}) tabGroup: MatTabGroup;
  @ViewChild('virtualScroll', {static: false}) virtualScroll: CdkVirtualScrollViewport;

  constructor(
    private dbEntityMarkerService: DbEntityMarkerService,
    private mapService: MapService,
    private selectionService: EntitySelectionService,
    private siteService: SiteService,
    private listManagerService: ListManagerService,
    private storeListService: StoreListService,
    private storageService: StorageService
  ) {
  }

  ngOnInit() {
    this.getSettings();
    let activeList = [];
    this.selectionService.singleSelect$.subscribe(selection => {
      if (selection.storeId) {
        for (let i = 0; i < this.siteMarkers.length; i++) {
          // Get the site
          const siteMarker = this.siteMarkers[i];
          // Try to find the store
          const store = siteMarker.stores.find(st => st.id === selection.storeId);
          // If the store is found, go the the right list and show the relevant tab
          if (store) {
            if (store.storeType === 'HISTORICAL') {
              this.selectedTabIndex = 1;
              activeList = this.historicalStores;
            } else if (store.storeType === 'ACTIVE') {
              this.selectedTabIndex = 2;
              activeList = this.activeStores;
            } else if (store.storeType === 'FUTURE') {
              this.selectedTabIndex = 3;
              activeList = this.futureStores;
            }
            // Once teh store has been found, break out of for loop
            break;
          }
        }
      } else {
        // If no storeId, then they must have clicked on an empty site marker
        this.selectedTabIndex = 0;
        activeList = this.emptySites;
      }

      setTimeout(() => {
        // Get the index of the siteListItem in the appropriate list
        const index = activeList.findIndex(siteListItem => siteListItem.siteId === selection.siteId);
        // If found, scroll to that position
        if (index !== -1) {
          this.virtualScroll.scrollToIndex(index);
        } else {
          console.log('Site not found');
        }
      }, 800);

    });
  }

  ngOnChanges() {
    this.emptySites = [];
    this.historicalStores = [];
    this.activeStores = [];
    this.futureStores = [];
    this.siteMarkers.forEach(siteMarker => {
      if (siteMarker.empty && this.dbEntityMarkerService.controls.showEmptySites) {
        this.emptySites.push(new SiteListItem(siteMarker));
      }
      const groupedStores = _.groupBy(siteMarker.stores, (st) => st.storeType);
      if (groupedStores['ACTIVE']) {
        const storeMarker = groupedStores['ACTIVE'].sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())[0];
        this.activeStores.push(new SiteListItem(siteMarker, storeMarker))
      }
      if (groupedStores['FUTURE']) {
        const storeMarker = groupedStores['FUTURE'].sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())[0];
        this.futureStores.push(new SiteListItem(siteMarker, storeMarker))
      }
      if (groupedStores['HISTORICAL']) {
        const storeMarker = groupedStores['HISTORICAL'].sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())[0];
        this.historicalStores.push(new SiteListItem(siteMarker, storeMarker))
      }
    });
    // this.sortSiteList();
  }

  private getSettings() {
    const getSortType = this.storageService.getOne(this.SORT_TYPE_STORAGE_KEY).pipe(tap(t => {
      if (t) {
        this.sortType = t
      }
    }));
    const getSortDirection = this.storageService.getOne(this.SORT_DIRECTION_STORAGE_KEY).pipe(tap(d => {
      if (d) {
        this.sortDirection = d
      }
    }));
    forkJoin([getSortType, getSortDirection]).subscribe(() => this.sortSiteList());
  }

  siteIsSelected(siteId: number) {
    return this.selectionService.siteIds.has(siteId);
  }

  storeIsSelected(storeId: number) {
    return this.selectionService.storeIds.has(storeId);
  }

  storeTypeChanged(event: MatRadioChange) {
    this.storeType = event.value;
    this.sortSiteList();
  }

  toggleSortDirection() {
    if (this.sortDirection === SortDirection.ASC) {
      this.sortDirection = SortDirection.DESC;
    } else {
      this.sortDirection = SortDirection.ASC;
    }
    this.storageService.set(this.SORT_DIRECTION_STORAGE_KEY, this.sortDirection);
    this.sortSiteList();
  }

  setSortType(event: MatSelectChange) {
    this.sortType = event.value;
    this.storageService.set(this.SORT_TYPE_STORAGE_KEY, this.sortType);
    this.sortSiteList();
  }

  private sortSiteList(): void {
    // this.siteListItems.sort((itemA, itemB) => {
    //     switch (this.sortType) {
    //       case SortType.STORE_NAME:
    //       case SortType.VALIDATED_DATE:
    //       case SortType.CREATED_DATE:
    //       case SortType.FLOAT:
    //         const storeA = this.getStoreForSort(itemA);
    //         const storeB = this.getStoreForSort(itemB);
    //         if (storeA && !storeB) {
    //           return 1;
    //         } else if (storeB && !storeA) {
    //           return -1;
    //         } else if (!storeA && !storeB) {
    //           return 0;
    //         }
    //         switch (this.sortType) {
    //           case SortType.STORE_NAME:
    //             return storeA.storeName.localeCompare(storeB.storeName);
    //           case SortType.VALIDATED_DATE:
    //             return DateUtil.compareDates(storeA.validatedDate, storeB.validatedDate);
    //           case SortType.CREATED_DATE:
    //             return DateUtil.compareDates(storeA.createdDate, storeB.createdDate);
    //           case SortType.FLOAT:
    //             return storeA.float === storeB.float ? 0 : storeA.float ? 1 : -1;
    //           default:
    //             return 0;
    //         }
    //
    //       case SortType.ASSIGNEE_NAME:
    //         return itemA.assigneeName.localeCompare(itemB.assigneeName);
    //       case SortType.BACK_FILLED_NON_GROCERY:
    //         return itemA.backfilledNonGrocery === itemB.backfilledNonGrocery ? 0 : itemA.backfilledNonGrocery ? -1 : 1;
    //       case SortType.LATITUDE:
    //         return itemA.coords.lat - itemB.coords.lat;
    //       case SortType.LONGITUDE:
    //         return itemA.coords.lng - itemB.coords.lng;
    //       default:
    //         return 0;
    //     }
    //   }
    // );
    //
    // if (this.sortDirection === SortDirection.DESC) {
    //   this.siteListItems.reverse();
    // }
    //
    // // Must re-assign in order for CDK-Virtural-Scroll to update
    // this.siteListItems = Object.assign([], this.siteListItems);
  }

  getSortByText(siteListItem: SiteListItem) {
    const text = this.sortType.toString() + ': ';
    if (siteListItem.store) {
      switch (this.sortType) {
        case SortType.CREATED_DATE:
          return text + `${new Date(siteListItem.store.createdDate).toLocaleDateString()}`;
        case SortType.FLOAT:
          return text + `${siteListItem.store.float ? 'True' : 'False'}`;
        case SortType.VALIDATED_DATE:
          if (siteListItem.store.validatedDate) {
            return text + `${new Date(siteListItem.store.validatedDate).toLocaleDateString()}`;
          } else {
            return 'Store not validated';
          }
      }
    } else {
      switch (this.sortType) {
        case SortType.ASSIGNEE_NAME:
          return siteListItem.assigneeName ? `${text}${siteListItem.assigneeName}` : 'Not Assigned';
        case SortType.BACK_FILLED_NON_GROCERY:
          return text + `${siteListItem.backfilledNonGrocery}`;
        case SortType.LATITUDE:
          return text + `${siteListItem.coords.lat}`;
        case SortType.LONGITUDE:
          return text + `${siteListItem.coords.lng}`;
      }
    }
  }

  getLogoPath(fileName: string) {
    return `https://res.cloudinary.com/mtn-retail-advisors/image/upload/c_limit,h_20/${fileName}`;
  }

  selectSite(siteId: number) {
    this.selectionService.singleSelect({siteId: siteId, storeId: null})
  }

  selectStore(siteId: number, storeId: number) {
    this.selectionService.singleSelect({siteId: siteId, storeId: storeId})
  }

  showOnMap(listItem) {
    this.mapService.setCenter(listItem.coords);
  }

  /**
   * Groups all stores of the same site into the same siteMarker object, since store lists only contain stores
   */
  private transformStoresForListView(storeList: StoreList): SiteMarker[] {
    const siteMarkers = {};
    storeList.stores.forEach((store: SimplifiedStore) => {
      let siteMarker = siteMarkers[store.site.id];
      if (!siteMarker) {
        siteMarker = new SiteMarker(store.site);
        siteMarker.stores = [];
        siteMarkers[store.site.id] = siteMarker;
      }
      siteMarker.stores.push(new StoreMarker(store));
    });
    return Object.keys(siteMarkers).map(siteId => siteMarkers[siteId]);
  }

  removeStoreFromList(storeMarker: StoreMarker) {
    // const store = new SimplifiedStore(storeMarker);
    // this.storeListService.removeStoresFromStoreList(this.selectedStoreListId, [store.id]).subscribe(storeList => {
    //   const siteMarkers = this.transformStoresForListView(storeList);
    //   this.storeSidenavService.updateSiteMarkers(siteMarkers);
    // });
  }

  removeSiteFromList(siteListItem: SiteListItem) {
    // TODO Decide if users can add empty sites to storeLists
  }
}
