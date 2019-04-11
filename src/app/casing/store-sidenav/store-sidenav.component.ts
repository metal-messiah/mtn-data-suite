import { Component, OnInit, Input } from '@angular/core';
import { StorageService } from 'app/core/services/storage.service';
import { Pages } from './store-sidenav-pages';
import { StoreSidenavService } from './store-sidenav.service';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';


@Component({
  selector: 'mds-store-sidenav',
  templateUrl: './store-sidenav.component.html',
  styleUrls: ['./store-sidenav.component.css']
})
export class StoreSidenavComponent implements OnInit {

  pages = Pages;

  @Input() expanded: boolean;

  constructor(private storeSidenavService: StoreSidenavService) { }

  ngOnInit() {



  }

  isPage(page: Pages) {
    return (this.storeSidenavService.currentPage === page);
  }

  setPage(page: Pages) {
    this.storeSidenavService.setPage(page);
  }

}
