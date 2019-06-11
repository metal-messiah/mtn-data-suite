import { Component, OnInit } from '@angular/core';
import { ListManagerService } from '../list-manager/list-manager.service';
import { ListManagerViews } from '../list-manager/list-manager-views';

@Component({
  selector: 'mds-store-sidenav',
  templateUrl: './store-sidenav.component.html',
  styleUrls: ['./store-sidenav.component.css']
})
export class StoreSidenavComponent implements OnInit {

  constructor(private listManagerService: ListManagerService) {
  }

  ngOnInit() {
  }

  isInListOfStoresView() {
    return this.listManagerService.view === ListManagerViews.VIEWSTORES;
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
