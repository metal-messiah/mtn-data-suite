import { Injectable } from '@angular/core';
import { Pages } from './store-sidenav-pages';
import { StorageService } from 'app/core/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class StoreSidenavService {

  pages = Pages;
  public currentPage: Pages = null;

  sidenavPageStorageKey = 'currentPage'

  constructor(private storageService: StorageService) {
    this.storageService.getOne(this.sidenavPageStorageKey).subscribe((currentPage) => {
      if (currentPage !== undefined) {
        this.currentPage = currentPage;
      }
    })
  }

  setPage(page: Pages) {
    this.currentPage = page;
    this.storageService.set(this.sidenavPageStorageKey, this.currentPage).subscribe(resp => {
      console.log(resp)
    })
  }
}
