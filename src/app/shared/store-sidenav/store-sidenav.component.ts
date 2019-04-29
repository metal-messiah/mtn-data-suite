import { Component, OnInit, Input } from '@angular/core';
import { StoreSidenavService } from './store-sidenav.service';
import { CasingDashboardMode } from 'app/casing/casing-dashboard/casing-dashboard.component';
import { ListManagerService } from '../list-manager/list-manager.service';
import { Pages as ListManagerPages } from '../list-manager/list-manager-pages';
import { Pages as StoreSidenavPages } from './store-sidenav-pages';
import { StoreListService } from 'app/core/services/store-list.service';


@Component({
  selector: 'mds-store-sidenav',
  templateUrl: './store-sidenav.component.html',
  styleUrls: ['./store-sidenav.component.css']
})
export class StoreSidenavComponent implements OnInit {

  pages = StoreSidenavPages;

  isFetchingStores = false;

  @Input() expanded: boolean;
  @Input() visibleStores: number;

  constructor(private storeSidenavService: StoreSidenavService, private listManagerService: ListManagerService, private storeListService: StoreListService) { }

  ngOnInit() { }

  isPage(page: StoreSidenavPages) {
    return (this.storeSidenavService.getPage() === page);
  }

  setPage(page: StoreSidenavPages) {
    this.storeSidenavService.setPage(page);
  }

  getStoreListFetching() {
    return this.storeSidenavService.getFetching();
  }

  getSelectedStoresCount(): number {
    return this.storeSidenavService.getMapSelections().selectedStoreIds.size;
  }

  zoomToSelection() {
    this.storeSidenavService.zoomToSelectionSet();
  }

  isMultiSelect() {
    return this.storeSidenavService.getSelectedDashboardMode() === CasingDashboardMode.MULTI_SELECT;
  }

  selectAllVisible() {
    this.storeSidenavService.selectAllVisible();
  }

  selectAllFromList() {
    const { selectedStoreList } = this.listManagerService;
    this.storeSidenavService.selectAllByIds(selectedStoreList.storeIds);
  }

  isInListOfStoresView() {
    return this.listManagerService.page === ListManagerPages.VIEWSTORES;
  }

  getListPageText(): string {
    let output = '';
    switch (this.listManagerService.page) {
      case ListManagerPages.VIEWSTORES:
        const { selectedStoreList } = this.listManagerService;
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
        this.listManagerService.setPage(ListManagerPages.LISTMANAGER);
        // this.listManagerService.setSelectedStoreList(null, ListManagerPages.LISTMANAGER)
        break;
    }
  }
}
