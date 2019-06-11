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
import { MatRadioChange, MatSelectChange } from '@angular/material';
import { DateUtil } from '../../utils/date-util';
import * as _ from 'lodash';

class SiteListItem {
  siteId: number;
  address: string;
  intersection: string;
  coords: Coordinates;
  backfilledNonGrocery: boolean;
  empty: boolean;
  assigneeName: string;
  activeStore: StoreMarker;
  historicalStores: StoreMarker[] = [];
  futureStores: StoreMarker[] = [];

  constructor(siteMarker: SiteMarker) {
    this.siteId = siteMarker.id;
    this.address = this.getAddressLabel(siteMarker);
    this.intersection = this.getFormattedIntersection(siteMarker);
    this.coords = new Coordinates(siteMarker.latitude, siteMarker.longitude);
    this.backfilledNonGrocery = siteMarker.backfilledNonGrocery;
    this.empty = siteMarker.empty;
    this.assigneeName = siteMarker.assigneeName;

    siteMarker.stores.forEach(store => {
      if (store.storeType === 'HISTORICAL') {
        this.historicalStores.push(store);
      } else if (store.storeType === 'FUTURE') {
        this.futureStores.push(store);
      } else if (store.storeType === 'ACTIVE') {
        this.activeStore = store;
      }
    })
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
  private readonly STORE_TYPES = ['Historical', 'Active', 'Future'];

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

  fetching = false;

  canDelete = false;
  SortDirection = SortDirection;
  siteListItems: SiteListItem[];

  storeType = 'Active';
  sortType: SortType = SortType.STORE_NAME;
  sortDirection: SortDirection = SortDirection.ASC;

  @Input() siteMarkers = [];

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
    this.selectionService.singleSelect$.subscribe(selection => {
      const index = this.siteListItems.findIndex(sm => sm.siteId === selection.siteId);
      this.virtualScroll.scrollToIndex(index);
    });
  }

  ngOnChanges() {
    this.siteListItems = this.siteMarkers.map(siteMarker => new SiteListItem(siteMarker));
    this.sortSiteList();
  }

  private getSettings() {
    const getSortType = this.storageService.getOne(this.SORT_TYPE_STORAGE_KEY);
    const getSortDirection = this.storageService.getOne(this.SORT_DIRECTION_STORAGE_KEY);
    forkJoin([getSortType, getSortDirection]).subscribe(sortOptions => {
      this.sortType = sortOptions[0] as SortType;
      this.sortDirection = sortOptions[1] as SortDirection;
      this.sortSiteList();
    });
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

  getStoreForSort(siteA: SiteListItem) {
    if (this.storeType === 'Active') {
      return siteA.activeStore;
    } else if (this.storeType === 'Historical') {
      return _.maxBy(siteA.historicalStores, (st: StoreMarker) => st.createdDate);
    } else if (this.storeType === 'Future') {
      return _.maxBy(siteA.futureStores, (st: StoreMarker) => st.createdDate);
    }
    return null;
  }

  private sortSiteList(): void {
    console.log('Sorting list');
    this.siteListItems.sort((itemA, itemB) => {
        switch (this.sortType) {
          case SortType.STORE_NAME:
          case SortType.VALIDATED_DATE:
          case SortType.CREATED_DATE:
          case SortType.FLOAT:
            const storeA = this.getStoreForSort(itemA);
            const storeB = this.getStoreForSort(itemB);
            if (storeA && !storeB) {
              return 1;
            } else if (storeB && !storeA) {
              return -1;
            }
            switch (this.sortType) {
              case SortType.STORE_NAME:
                return storeA.storeName.localeCompare(storeB.storeName);
              case SortType.VALIDATED_DATE:
                return DateUtil.compareDates(storeA.validatedDate, storeB.validatedDate);
              case SortType.CREATED_DATE:
                return DateUtil.compareDates(storeA.createdDate, storeB.createdDate);
              case SortType.FLOAT:
                return storeA.float === storeB.float ? 0 : storeA.float ? 1 : -1;
              default:
                return 0;
            }

          case SortType.ASSIGNEE_NAME:
            return itemA.assigneeName.localeCompare(itemB.assigneeName);
          case SortType.BACK_FILLED_NON_GROCERY:
            return itemA.backfilledNonGrocery === itemB.backfilledNonGrocery ? 0 : itemA.backfilledNonGrocery ? -1 : 1;
          case SortType.LATITUDE:
            return itemA.coords.lat - itemB.coords.lat;
          case SortType.LONGITUDE:
            return itemA.coords.lng - itemB.coords.lng;
          default:
            return 0;
        }
      }
    );

    if (this.sortDirection === SortDirection.DESC) {
      this.siteListItems.reverse();
    }

    // Must re-assign in order for CDK-Virtural-Scroll to update
    this.siteListItems = Object.assign([], this.siteListItems);
  }

  getSortByText(siteListItem: SiteListItem) {
    const text = this.sortType.toString() + ': ';
    const store = this.getStoreForSort(siteListItem);
    switch (this.sortType) {
      case SortType.ASSIGNEE_NAME:
        return siteListItem.assigneeName ? `${text}${siteListItem.assigneeName}` : 'Not Assigned';
      case SortType.BACK_FILLED_NON_GROCERY:
        return text + `${siteListItem.backfilledNonGrocery}`;
      case SortType.CREATED_DATE:
        return text + `${new Date(store.createdDate).toLocaleDateString()}`;
      case SortType.FLOAT:
        return text + `${store.float ? store.float : 'False'}`;
      case SortType.LATITUDE:
        return text + `${siteListItem.coords.lat}`;
      case SortType.LONGITUDE:
        return text + `${siteListItem.coords.lng}`;
      case SortType.VALIDATED_DATE:
        if (store.validatedDate) {
          return text + `${new Date(store.validatedDate).toLocaleDateString()}`;
        } else {
          return 'Store not validated';
        }
      default:
        return 'Sorting on: ' + this.sortType.toString();
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
}
