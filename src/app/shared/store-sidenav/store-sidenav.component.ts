import { Component, Input, OnInit } from '@angular/core';
import { StoreSidenavService } from './store-sidenav.service';
import { ListManagerService } from '../list-manager/list-manager.service';
import { ListManagerViews } from '../list-manager/list-manager-views';
import { StoreSidenavViews } from './store-sidenav-views';
import { map } from 'rxjs/operators';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { Coordinates } from '../../models/coordinates';
import { SimplifiedSite } from '../../models/simplified/simplified-site';
import { forkJoin } from 'rxjs';
import { MapService } from '../../core/services/map.service';
import { SiteService } from '../../core/services/site.service';
import { StoreService } from '../../core/services/store.service';
import { CasingDashboardMode } from '../../casing/enums/casing-dashboard-mode';
import { DbEntityMarkerService } from '../../core/services/db-entity-marker.service';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { CasingDashboardService } from '../../casing/casing-dashboard/casing-dashboard.service';

@Component({
  selector: 'mds-store-sidenav',
  templateUrl: './store-sidenav.component.html',
  styleUrls: ['./store-sidenav.component.css']
})
export class StoreSidenavComponent implements OnInit {

  pages = StoreSidenavViews;

  constructor(private storeSidenavService: StoreSidenavService,
              private mapService: MapService,
              private siteService: SiteService,
              private storeService: StoreService,
              private casingDashboardService: CasingDashboardService,
              private selectionService: EntitySelectionService,
              private dbEntityMarkerService: DbEntityMarkerService,
              private listManagerService: ListManagerService) {
  }

  ngOnInit() {
  }

  isView(view: StoreSidenavViews) {
    return (this.storeSidenavService.currentView === view);
  }

  setView(view: StoreSidenavViews) {
    this.storeSidenavService.setView(view);
  }

  get fetching() {
    return this.storeSidenavService.fetching;
  }







  selectAllFromList() {
    const {selectedStoreList} = this.listManagerService;
    this.selectionService.selectByIds({siteIds: [], storeIds: selectedStoreList.storeIds});
  }

  isInListOfStoresView() {
    return this.listManagerService.view === ListManagerViews.VIEWSTORES;
  }

  getListViewText(): string {
    let output = '';
    switch (this.listManagerService.view) {
      case ListManagerViews.VIEWSTORES:
        const {selectedStoreList} = this.listManagerService;
        output = `${selectedStoreList.storeCount.toLocaleString()} Stores in ${this.listManagerService.selectedStoreList.storeListName}`;
        break;
      default:
        output = `My Lists`;
    }
    return output;
  }

  listManagerGoBack() {
    switch (this.listManagerService.view) {
      case ListManagerViews.LISTMANAGER:
        this.setView(null);
        break;
      case ListManagerViews.VIEWSTORES:
        this.listManagerService.setView(ListManagerViews.LISTMANAGER);
        // this.listManagerService.setSelectedStoreList(null, ListManagerPages.LISTMANAGER)
        break;
    }
  }

  storeListIsCurrentFilter() {
    const {selectedStoreList} = this.listManagerService;
    if (selectedStoreList) {
      return this.listManagerService.storeListIsCurrentFilter(selectedStoreList);
    }
    return false;
  }

  filterMap() {
    const {selectedStoreList} = this.listManagerService;
    if (!this.storeListIsCurrentFilter()) {
      this.listManagerService.setStoreListAsCurrentFilter(selectedStoreList);
    }
  }

  clearMapFilter() {
    this.listManagerService.setStoreListAsCurrentFilter(null);
  }
}
