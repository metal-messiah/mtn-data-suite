import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MapService } from '../../core/services/map.service';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatCheckboxChange, MatSelectChange, MatTabGroup } from '@angular/material';
import { StoreListUIService } from '../store-sidenav/store-list-u-i.service';
import { SiteListItem } from './site-list-item';
import { SortDirection } from '../../core/functionalEnums/sort-direction';

@Component({
  selector: 'mds-stores-list',
  templateUrl: './stores-list.component.html',
  styleUrls: ['./stores-list.component.css']
})
export class StoresListComponent implements OnInit {

  SortDirection = SortDirection;

  selectedTabIndex = 2;

  @Input() showVacancies = true;

  @ViewChild('tabGroup', {static: false}) tabGroup: MatTabGroup;
  @ViewChild('virtualScroll', {static: false}) virtualScroll: CdkVirtualScrollViewport;

  constructor(
    private mapService: MapService,
    private selectionService: EntitySelectionService,
    private storeListUIService: StoreListUIService
  ) {
  }

  ngOnInit() {
    this.selectionService.singleSelect$.subscribe(selection => this.onSelection(selection));
  }

  get fetching() {
    return this.storeListUIService.fetching;
  }

  get sortType() {
    return this.storeListUIService.sortType;
  }

  get sortDirection() {
    return this.storeListUIService.sortDirection;
  }

  get sortGroups() {
    return this.storeListUIService.sortGroups;
  }

  get storeTabs() {
    return this.storeListUIService.storeTabs;
  }

  get vacantSites() {
    return this.storeListUIService.vacantSites;
  }

  private scrollToItem(tabIndex: number, siteId: number, list: SiteListItem[]) {
    // Get the index of the siteListItem in the list
    const siteIndex = list.findIndex(siteListItem => siteListItem.siteId === siteId);

    // If found, scroll to that position
    if (siteIndex !== -1) {
      // If the tab is already selected
      if (tabIndex === this.selectedTabIndex) {
        // Don't wait to scroll
        this.virtualScroll.scrollToIndex(siteIndex, 'smooth');
      } else {
        this.selectedTabIndex = tabIndex;
        // Must wait to scroll until after tab is loaded
        setTimeout(() => this.virtualScroll.scrollToIndex(siteIndex, 'smooth'), 800);
      }
    } else {
      console.log('Site not found');
    }
  }

  /*************************
   * Selection
   *************************/

  get multiSelecting() {
    return this.selectionService.isMultiSelecting();
  }

  private onSelection(selection) {
    if (selection.storeId) {
      for (let i = 0; i < this.storeListUIService.siteMarkers.length; i++) {
        // Get the site
        const siteMarker = this.storeListUIService.siteMarkers[i];
        // Try to find the store
        const store = siteMarker.stores.find(st => st.id === selection.storeId);
        // If the store is found, go the the right list and show the relevant tab
        if (store) {
          if (store.storeType === 'HISTORICAL') {
            this.scrollToItem(1, selection.siteId, this.storeListUIService.historicalStores);
          } else if (store.storeType === 'ACTIVE') {
            this.scrollToItem(2, selection.siteId, this.storeListUIService.activeStores);
          } else if (store.storeType === 'FUTURE') {
            this.scrollToItem(3, selection.siteId, this.storeListUIService.futureStores);
          }
          // Once the store has been found, break out of for loop
          break;
        }
      }
    } else {
      this.scrollToItem(0, selection.siteId, this.storeListUIService.vacantSites);
    }
  }

  selectAllInList(storeList: SiteListItem[], change: MatCheckboxChange) {
    if (storeList === this.storeListUIService.vacantSites) {
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

  selectSite(siteId: number) {
    this.selectionService.singleSelect({siteId: siteId, storeId: null})
  }

  selectStore(siteId: number, storeId: number) {
    this.selectionService.singleSelect({siteId: siteId, storeId: storeId})
  }

  toggleSortDirection() {
    this.storeListUIService.toggleSortDirection();
  }

  setSortType(event: MatSelectChange) {
    this.storeListUIService.setSortType(event.value);
  }

  getSortByText(siteListItem: SiteListItem) {
    return this.storeListUIService.getSortByText(siteListItem);
  }

  getLogoPath(fileName: string) {
    return `https://res.cloudinary.com/mtn-retail-advisors/image/upload/c_limit,h_20/${fileName}`;
  }

  showOnMap(listItem) {
    this.mapService.setCenter(listItem.coords);
  }

}
