import { Component, Input, OnInit } from '@angular/core';
import { StoreSidenavService } from './store-sidenav.service';
import { ListManagerService } from '../list-manager/list-manager.service';
import { Pages as ListManagerPages } from '../list-manager/list-manager-pages';
import { StoreSidenavViews as StoreSidenavPages } from './store-sidenav-pages';
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

  pages = StoreSidenavPages;

  @Input() expanded: boolean;

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

  isPage(page: StoreSidenavPages) {
    return (this.storeSidenavService.currentView === page);
  }

  setPage(page: StoreSidenavPages) {
    this.storeSidenavService.setView(page);
  }

  get fetching() {
    return this.storeSidenavService.fetching;
  }

  getSelectedStoresCount(): number {
    return this.selectionService.storeIds.size;
  }

  zoomToSelection() {
    const requests = [];
    if (this.selectionService.storeIds.size) {
      requests.push(this.storeService.getAllByIds(Array.from(this.selectionService.storeIds))
        .pipe(map((stores: SimplifiedStore[]) =>
          stores.map((s: SimplifiedStore) => new Coordinates(s.site.latitude, s.site.longitude)))));
    }
    if (this.selectionService.siteIds.size) {
      requests.push(this.siteService.getAllByIds(Array.from(this.selectionService.siteIds))
        .pipe(map((sites: SimplifiedSite[]) =>
          sites.map((s: SimplifiedSite) => new Coordinates(s.latitude, s.longitude)))));
    }

    forkJoin(requests).subscribe(results => {
      const points = [].concat(...results);
      this.mapService.fitToPoints(points);
    });
  }

  isMultiSelect() {
    return this.casingDashboardService.getSelectedDashboardMode() === CasingDashboardMode.MULTI_SELECT;
  }

  selectAllVisible() {
    const visibleStoreIds = this.storeSidenavService.getVisibleStoreIds();
    this.selectionService.selectByIds({siteIds: [], storeIds: visibleStoreIds});
  }

  selectAllFromList() {
    const {selectedStoreList} = this.listManagerService;
    this.selectionService.selectByIds({siteIds: [], storeIds: selectedStoreList.storeIds});
  }

  isInListOfStoresView() {
    return this.listManagerService.page === ListManagerPages.VIEWSTORES;
  }

  getListPageText(): string {
    let output = '';
    switch (this.listManagerService.page) {
      case ListManagerPages.VIEWSTORES:
        const {selectedStoreList} = this.listManagerService;
        output = `${selectedStoreList.storeCount.toLocaleString()} Stores in ${this.listManagerService.selectedStoreList.storeListName}`;
        break;
      default:
        output = `My Lists`;
    }
    return output;
  }

  listManagerGoBack() {
    switch (this.listManagerService.page) {
      case ListManagerPages.LISTMANAGER:
        this.setPage(null);
        break;
      case ListManagerPages.VIEWSTORES:
        this.listManagerService.setView(ListManagerPages.LISTMANAGER);
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
