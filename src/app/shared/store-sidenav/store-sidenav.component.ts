import { Component, OnInit, Input } from '@angular/core';
import { Pages } from './store-sidenav-pages';
import { StoreSidenavService } from './store-sidenav.service';
import { CasingDashboardMode } from 'app/casing/casing-dashboard/casing-dashboard.component';


@Component({
  selector: 'mds-store-sidenav',
  templateUrl: './store-sidenav.component.html',
  styleUrls: ['./store-sidenav.component.css']
})
export class StoreSidenavComponent implements OnInit {

  pages = Pages;

  isFetchingStores = false;

  @Input() expanded: boolean;
  @Input() visibleStores: number;

  constructor(private storeSidenavService: StoreSidenavService) { }

  ngOnInit() { }

  isPage(page: Pages) {
    return (this.storeSidenavService.getPage() === page);
  }

  setPage(page: Pages) {
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
}
