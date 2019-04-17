import { Component, OnInit, Input } from '@angular/core';
import { Pages } from './store-sidenav-pages';
import { StoreSidenavService } from './store-sidenav.service';


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
    return (this.storeSidenavService.currentPage === page);
  }

  setPage(page: Pages) {
    this.storeSidenavService.setPage(page);
  }

  storesListIsFetching(isFetchingStores: boolean) {
    setTimeout(() => {

      this.isFetchingStores = isFetchingStores;
    }, 1)
  }

}
