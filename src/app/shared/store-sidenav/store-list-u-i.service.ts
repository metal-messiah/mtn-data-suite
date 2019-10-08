import { Injectable } from '@angular/core';
import { SortType } from '../../core/functionalEnums/site-list-sort-type';
import { DateUtil } from '../../utils/date-util';
import { SortDirection } from '../../core/functionalEnums/sort-direction';
import { SiteMarker } from '../../models/site-marker';
import * as _ from 'lodash';
import { SiteListItem } from '../stores-list/site-list-item';
import { tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { StorageService } from '../../core/services/storage.service';
import { DbEntityMarkerControls } from '../../models/db-entity-marker-controls';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { DownloadDialogComponent } from 'app/casing/download-dialog/download-dialog.component';
import { MatDialog } from '@angular/material';

@Injectable()
export class StoreListUIService {
  private readonly SORT_TYPE_STORAGE_KEY = 'storesListSortType';
  private readonly SORT_DIRECTION_STORAGE_KEY = 'storesListSortDirection';

  private readonly COMPARATORS = [
    {
      sortType: SortType.STORE_NAME,
      compare: (a: SiteListItem, b: SiteListItem) => {
        if (a.store && b.store) {
          const result = a.store.storeName.localeCompare(b.store.storeName);
          return result === 0 ? a.coords.lat - b.coords.lat : result;
        } else {
          return a.coords.lat - b.coords.lat;
        }
      }
    },
    {
      sortType: SortType.FLOAT,
      compare: (a: SiteListItem, b: SiteListItem) => {
        if (a.store && b.store) {
          return a.store.float === b.store.float ? this.defaultComparator.compare(a, b) : a.store.float ? 1 : -1;
        } else {
          return this.defaultComparator.compare(a, b);
        }
      }
    },
    {
      sortType: SortType.CREATED_DATE,
      compare: (a: SiteListItem, b: SiteListItem) => {
        if (a.store && b.store) {
          const result = DateUtil.compareDates(a.store.createdDate, b.store.createdDate);
          return result === 0 ? this.defaultComparator.compare(a, b) : result;
        } else {
          return this.defaultComparator.compare(a, b);
        }
      }
    },
    {
      sortType: SortType.VALIDATED_DATE,
      compare: (a: SiteListItem, b: SiteListItem) => {
        if (a.store && b.store) {
          const result = DateUtil.compareDates(a.store.validatedDate, b.store.validatedDate);
          return result === 0 ? this.defaultComparator.compare(a, b) : result;
        } else {
          return this.defaultComparator.compare(a, b);
        }
      }
    },
    {
      sortType: SortType.LATITUDE,
      compare: (a: SiteListItem, b: SiteListItem) => a.coords.lat - b.coords.lat
    },
    {
      sortType: SortType.LONGITUDE,
      compare: (a: SiteListItem, b: SiteListItem) => a.coords.lng - b.coords.lng
    },
    {
      sortType: SortType.ASSIGNEE_NAME,
      compare: (a: SiteListItem, b: SiteListItem) => {
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
      sortType: SortType.BACK_FILLED_NON_GROCERY,
      compare: (a: SiteListItem, b: SiteListItem) => {
        return a.backfilledNonGrocery === b.backfilledNonGrocery
          ? this.defaultComparator.compare(a, b)
          : a.backfilledNonGrocery
          ? -1
          : 1;
      }
    }
  ];

  private readonly defaultComparator = this.COMPARATORS.find(c => c.sortType === SortType.STORE_NAME);

  private _historicalStores = [];
  private _activeStores = [];
  private _futureStores = [];

  private _siteMarkers = [];

  readonly sortGroups = [
    {
      name: 'Store',
      keys: [SortType.STORE_NAME, SortType.FLOAT, SortType.CREATED_DATE, SortType.VALIDATED_DATE]
    },
    {
      name: 'Site',
      keys: [SortType.LATITUDE, SortType.LONGITUDE, SortType.ASSIGNEE_NAME, SortType.BACK_FILLED_NON_GROCERY]
    }
  ];

  readonly storeTabs = [
    { tabTitle: 'Historical', getStores: () => this._historicalStores },
    { tabTitle: 'Active', getStores: () => this._activeStores },
    { tabTitle: 'Future', getStores: () => this._futureStores }
  ];

  vacantSites = [];

  fetching = false;

  sortType: SortType = SortType.STORE_NAME;
  sortDirection: SortDirection = SortDirection.ASC;

  constructor(private storageService: StorageService, private dialog: MatDialog) {
    this.getPersistedSettings();
  }

  private getPersistedSettings() {
    const getSortType = this.storageService.getOne(this.SORT_TYPE_STORAGE_KEY).pipe(
      tap(t => {
        if (t) {
          this.sortType = t;
        }
      })
    );
    const getSortDirection = this.storageService.getOne(this.SORT_DIRECTION_STORAGE_KEY).pipe(
      tap(d => {
        if (d) {
          this.sortDirection = d;
        }
      })
    );
    forkJoin([getSortType, getSortDirection]).subscribe(() => this.sortSiteLists());
  }

  private sortSiteLists(): void {
    this.vacantSites = this.getSortedStoreList(this.vacantSites);
    this._historicalStores = this.getSortedStoreList(this._historicalStores);
    this._activeStores = this.getSortedStoreList(this._activeStores);
    this._futureStores = this.getSortedStoreList(this._futureStores);
  }

  private getSortedStoreList(list: SiteListItem[]) {
    const comparator = this.COMPARATORS.find(c => c.sortType === this.sortType);

    list.sort((itemA, itemB) => comparator.compare(itemA, itemB));

    if (this.sortDirection === SortDirection.DESC) {
      list.reverse();
    }
    return Object.assign([], list);
  }

  get historicalStores() {
    return this._historicalStores;
  }

  get activeStores() {
    return this._activeStores;
  }

  get futureStores() {
    return this._futureStores;
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

  setSortType(sortType: SortType) {
    this.sortType = sortType;
    this.storageService.set(this.SORT_TYPE_STORAGE_KEY, this.sortType).subscribe();
    this.sortSiteLists();
  }

  toggleSortDirection() {
    if (this.sortDirection === SortDirection.ASC) {
      this.sortDirection = SortDirection.DESC;
    } else {
      this.sortDirection = SortDirection.ASC;
    }
    this.storageService.set(this.SORT_DIRECTION_STORAGE_KEY, this.sortDirection).subscribe();
    this.sortSiteLists();
  }

  get siteMarkers() {
    return this._siteMarkers;
  }

  setSiteMarkers(siteMarkers: SiteMarker[], controls: DbEntityMarkerControls) {
    this._siteMarkers = siteMarkers;
    this.vacantSites = [];
    this._historicalStores = [];
    this._activeStores = [];
    this._futureStores = [];
    siteMarkers.forEach((siteMarker: SiteMarker) => {
      if (
        siteMarker.vacant &&
        controls.showVacantSites &&
        (controls.showSitesBackfilledByNonGrocery || !siteMarker.backfilledNonGrocery)
      ) {
        this.vacantSites.push(new SiteListItem(siteMarker));
      }
      const groupedStores = _.groupBy(siteMarker.stores, st => st.storeType);
      if (groupedStores['ACTIVE']) {
        const storeMarker = groupedStores['ACTIVE'].sort(
          (a, b) => b.createdDate.getTime() - a.createdDate.getTime()
        )[0];
        this._activeStores.push(new SiteListItem(siteMarker, storeMarker));
      }
      if (groupedStores['FUTURE']) {
        const storeMarker = groupedStores['FUTURE'].sort(
          (a, b) => b.createdDate.getTime() - a.createdDate.getTime()
        )[0];
        this._futureStores.push(new SiteListItem(siteMarker, storeMarker));
      }
      if (groupedStores['HISTORICAL']) {
        const storeMarker = groupedStores['HISTORICAL'].sort(
          (a, b) => b.createdDate.getTime() - a.createdDate.getTime()
        )[0];
        this._historicalStores.push(new SiteListItem(siteMarker, storeMarker));
      }
    });
    this.sortSiteLists();
  }

  openDownloadDialog(storeList: SimplifiedStoreList) {
    const config = {
      data: { selectedStoreList: storeList },
      maxWidth: '90%'
    };
    this.dialog.open(DownloadDialogComponent, config);
  }
}
