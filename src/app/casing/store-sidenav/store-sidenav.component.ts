import { Component, OnInit } from '@angular/core';
import { Pages } from './store-sidenave-pages';


@Component({
  selector: 'mds-store-sidenav',
  templateUrl: './store-sidenav.component.html',
  styleUrls: ['./store-sidenav.component.css']
})
export class StoreSidenavComponent implements OnInit {
  pages = Pages;
  currentPage: Pages = null;

  constructor() { }

  ngOnInit() {
  }

  isPage(page: Pages) {
    return (this.currentPage === page);
  }

  setPage(page: Pages) {
    this.currentPage = page;
  }

}
