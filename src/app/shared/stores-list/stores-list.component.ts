import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { StoreMarker } from 'app/models/store-marker';
import { SiteMarker } from 'app/models/site-marker';
import { SiteService } from 'app/core/services/site.service';
import { DbEntityMarkerService } from '../../core/services/db-entity-marker.service';
import { MapService } from '../../core/services/map.service';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ListManagerService } from '../list-manager/list-manager.service';
import { StoreListService } from '../../core/services/store-list.service';
import { SortDirection } from '../../core/functionalEnums/sort-direction';
import { Coordinates } from '../../models/coordinates';
import { StorageService } from '../../core/services/storage.service';
import { forkJoin } from 'rxjs';
import { SiteUtil } from '../../utils/SiteUtil';
import { SortType } from '../../core/functionalEnums/site-list-sort-type';
import { MatCheckboxChange, MatSelectChange, MatTabGroup } from '@angular/material';
import * as _ from 'lodash';
import { tap } from 'rxjs/operators';
import { DateUtil } from '../../utils/date-util';

class SiteListItem {
  siteId: number;
  address: string;
  intersection: string;
  coords: Coordinates;
  backfilledNonGrocery: boolean;
  vacant: boolean;
  assigneeName: string;
  store: StoreMarker;

  constructor(siteMarker: SiteMarker, storeMarker?: StoreMarker) {
    this.siteId = siteMarker.id;
    this.address = this.getAddressLabel(siteMarker);
    this.intersection = this.getFormattedIntersection(siteMarker);
    this.coords = new Coordinates(siteMarker.latitude, siteMarker.longitude);
    this.backfilledNonGrocery = siteMarker.backfilledNonGrocery;
    this.vacant = siteMarker.vacant;
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

  private readonly COMPARATORS = [
    {
      sortType: SortType.STORE_NAME, compare: (a: SiteListItem, b: SiteListItem) => {
        if (a.store && b.store) {
          const result = a.store.storeName.localeCompare(b.store.storeName);
          return result === 0 ? a.coords.lat - b.coords.lat : result;
        } else {
          return a.coords.lat - b.coords.lat;
        }
      }
    },
    {
      sortType: SortType.FLOAT, compare: (a: SiteListItem, b: SiteListItem) => {
        if (a.store && b.store) {
          return a.store.float === b.store.float ? this.defaultComparator.compare(a, b) : a.store.float ? 1 : -1;
        } else {
          return this.defaultComparator.compare(a, b);
        }
      }
    },
    {
      sortType: SortType.CREATED_DATE, compare: (a: SiteListItem, b: SiteListItem) => {
        if (a.store && b.store) {
          const result = DateUtil.compareDates(a.store.createdDate, b.store.createdDate);
          return result === 0 ? this.defaultComparator.compare(a, b) : result;
        } else {
          return this.defaultComparator.compare(a, b);
        }
      }
    },
    {
      sortType: SortType.VALIDATED_DATE, compare: (a: SiteListItem, b: SiteListItem) => {
        if (a.store && b.store) {
          const result = DateUtil.compareDates(a.store.validatedDate, b.store.validatedDate);
          return result === 0 ? this.defaultComparator.compare(a, b) : result;
        } else {
          return this.defaultComparator.compare(a, b);
        }

      }
    },
    {
      sortType: SortType.LATITUDE, compare: (a: SiteListItem, b: SiteListItem) => a.coords.lat - b.coords.lat
    },
    {
      sortType: SortType.LONGITUDE, compare: (a: SiteListItem, b: SiteListItem) => a.coords.lng - b.coords.lng
    },
    {
      sortType: SortType.ASSIGNEE_NAME, compare: (a: SiteListItem, b: SiteListItem) => {
        if (a.assigneeName && b.assigneeName) {
          const result = a.assigneeName.localeCompare(b.assigneeName);
          return result === 0 ? this.defaultComparator.compare(a, b) : result;
        } else if (!a.assigneeName && !b.assigneeName) {
          return this.defaultComparator.compare(a, b);
        } else {
          return a.assigneeName ? -1 : 1;
        }
      }
    },
    {
      sortType: SortType.BACK_FILLED_NON_GROCERY, compare: (a: SiteListItem, b: SiteListItem) => {
        return a.backfilledNonGrocery === b.backfilledNonGrocery ? this.defaultComparator.compare(a, b) : a.backfilledNonGrocery ? -1 : 1;
      }
    }
  ];

  private readonly defaultComparator = this.COMPARATORS.find(c => c.sortType === SortType.STORE_NAME);


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

  vacantSites = [];
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
    this.selectionService.singleSelect$.subscribe(selection => this.onSelection(selection));
  }

  ngOnChanges() {
    this.vacantSites = [];
    this.historicalStores = [];
    this.activeStores = [];
    this.futureStores = [];
    this.siteMarkers.forEach((siteMarker: SiteMarker) => {
      if (siteMarker.vacant && this.dbEntityMarkerService.controls.showVacantSites &&
        (this.dbEntityMarkerService.controls.showSitesBackfilledByNonGrocery || !siteMarker.backfilledNonGrocery)) {
        this.vacantSites.push(new SiteListItem(siteMarker));
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
    this.sortSiteLists();
  }

  private onSelection(selection) {
    if (selection.storeId) {
      for (let i = 0; i < this.siteMarkers.length; i++) {
        // Get the site
        const siteMarker = this.siteMarkers[i];
        // Try to find the store
        const store = siteMarker.stores.find(st => st.id === selection.storeId);
        // If the store is found, go the the right list and show the relevant tab
        if (store) {
          if (store.storeType === 'HISTORICAL') {
            this.setTab(1, selection.siteId, this.historicalStores);
          } else if (store.storeType === 'ACTIVE') {
            this.setTab(2, selection.siteId, this.activeStores);
          } else if (store.storeType === 'FUTURE') {
            this.setTab(3, selection.siteId, this.futureStores);
          }
          // Once the store has been found, break out of for loop
          break;
        }
      }
    } else {
      this.setTab(0, selection.siteId, this.vacantSites);
    }
  }

  private setTab(tabIndex: number, siteId: number, list: SiteListItem[]) {
    // Get the index of the siteListItem in the list
    const siteIndex = list.findIndex(siteListItem => siteListItem.siteId === siteId);

    // If found, scroll to that position
    if (siteIndex !== -1) {
      // If the tab is already selected
      if (tabIndex === this.selectedTabIndex) {
        // Don't wait to scroll
        this.virtualScroll.scrollToIndex(siteIndex);
      } else {
        this.selectedTabIndex = tabIndex;
        // Must wait to scroll until after tab is loaded
        setTimeout(() => this.virtualScroll.scrollToIndex(siteIndex), 800);
      }
    } else {
      console.log('Site not found');
    }
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
    forkJoin([getSortType, getSortDirection]).subscribe(() => this.sortSiteLists());
  }

  get multiSelecting() {
    return this.selectionService.multiSelect;
  }

  selectAllInList(storeList: SiteListItem[], change: MatCheckboxChange) {
    if (storeList === this.vacantSites) {
      const siteIds = storeList.map(si => si.siteId);
      this.selectionService.selectByIds({siteIds: siteIds, storeIds: []}, !change.checked);
    } else {
      const storeIds = storeList.map(si => si.store.id);
      this.selectionService.selectByIds({siteIds: [], storeIds: storeIds}, !change.checked);
    }
  }

  siteIsSelected(siteId: number) {
    return this.selectionService.siteIds.has(siteId);
  }

  storeIsSelected(storeId: number) {
    return this.selectionService.storeIds.has(storeId);
  }

  toggleSortDirection() {
    if (this.sortDirection === SortDirection.ASC) {
      this.sortDirection = SortDirection.DESC;
    } else {
      this.sortDirection = SortDirection.ASC;
    }
    this.storageService.set(this.SORT_DIRECTION_STORAGE_KEY, this.sortDirection);
    this.sortSiteLists();
  }

  setSortType(event: MatSelectChange) {
    this.sortType = event.value;
    this.storageService.set(this.SORT_TYPE_STORAGE_KEY, this.sortType);
    this.sortSiteLists();
  }

  private sortSiteLists(): void {
    this.vacantSites = this.getSortedStoreList(this.vacantSites);
    this.historicalStores = this.getSortedStoreList(this.historicalStores);
    this.activeStores = this.getSortedStoreList(this.activeStores);
    this.futureStores = this.getSortedStoreList(this.futureStores);
  }

  private getSortedStoreList(list: SiteListItem[]) {
    const comparator = this.COMPARATORS.find(c => c.sortType === this.sortType);

    list.sort((itemA, itemB) => comparator.compare(itemA, itemB));

    if (this.sortDirection === SortDirection.DESC) {
      list.reverse();
    }
    return Object.assign([], list);
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
    }
    switch (this.sortType) {
      case SortType.ASSIGNEE_NAME:
        return siteListItem.assigneeName ? `${text}${siteListItem.assigneeName}` : 'Not Assigned';
      case SortType.BACK_FILLED_NON_GROCERY:
        return text + `${siteListItem.backfilledNonGrocery ? 'True' : 'False'}`;
      case SortType.LATITUDE:
        return text + `${siteListItem.coords.lat}`;
      case SortType.LONGITUDE:
        return text + `${siteListItem.coords.lng}`;
    }
    return null;
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

  removeStoreFromList(storeMarker: StoreMarker) {
    // const store = new SimplifiedStore(storeMarker);
    // this.storeListService.removeStoresFromStoreList(this.selectedStoreListId, [store.id]).subscribe(storeList => {
    //   const siteMarkers = this.transformStoresForListView(storeList);
    //   this.storeSidenavService.updateSiteMarkers(siteMarkers);
    // });
  }

  removeSiteFromList(siteListItem: SiteListItem) {
    // TODO Decide if users can add vacant sites to storeLists
  }
}
